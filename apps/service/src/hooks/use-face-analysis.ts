import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { useDetectionStore } from '@/stores/detection-store';
import { FaceTracker } from '@/lib/face-tracker';
import type { RawFaceDetection } from '@/lib/face-tracker';
import { saveFaceAnalysisLog } from '@/lib/detection-history';

import type * as faceApiType from 'face-api.js';
type FaceApiModule = typeof faceApiType;

let faceApiModule: FaceApiModule | null = null;
let loadingPromise: Promise<FaceApiModule> | null = null;
let modelsLoaded = false;

async function loadFaceApi(): Promise<FaceApiModule> {
  if (faceApiModule && modelsLoaded) return faceApiModule;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const faceapi = await import('face-api.js');
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models/face-api'),
        faceapi.nets.ageGenderNet.loadFromUri('/models/face-api'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models/face-api'),
      ]);
      faceApiModule = faceapi;
      modelsLoaded = true;
      return faceapi;
    } catch (error) {
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}

// 초당 5회로 감지 횟수 제한 — face-api.js는 COCO-SSD보다 무거워 rAF마다 실행 시 CPU 과부하
const DETECTION_INTERVAL_MS = 200;
// 추론 입력 크기 — 320×240으로 축소해 추론 속도 향상, 좌표는 스케일 복원
const RESIZE_WIDTH = 320;
const RESIZE_HEIGHT = 240;

interface UseFaceAnalysisOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useFaceAnalysis({ videoRef }: UseFaceAnalysisOptions): void {
  const faceAnalysisEnabled = useSettingsStore((s) => s.faceAnalysisEnabled);
  const webcamStatus = useDetectionStore((s) => s.webcamStatus);
  const enabled = faceAnalysisEnabled && webcamStatus === 'active';
  const setFaceResults = useDetectionStore((s) => s.setFaceAnalysisResults);

  const trackerRef = useRef(new FaceTracker());
  const rafRef = useRef<number>(0);
  const isRunningRef = useRef(false);
  const faceApiRef = useRef<FaceApiModule | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  // 리사이즈용 offscreen canvas — 매 프레임마다 생성 방지
  const resizeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // 마운트 시 고유 sessionId 생성 — 세션별 DB 조회 가능
  const sessionIdRef = useRef(
    `face-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );

  // detect 함수를 ref로 관리하여 useEffect 의존성 문제 해결
  // useCallback 대신 useRef를 쓰는 이유:
  //   - useCallback은 의존성 변경 시 새 참조를 반환 → useEffect 재실행 → rAF 루프 불안정
  //   - useRef는 항상 동일한 ref 객체를 유지 → 안정적인 rAF 루프 보장
  const detectRef = useRef<() => void>(() => {});

  // detect 구현을 detectRef.current에 할당
  // videoRef는 마운트 후 변경되지 않으므로 의존성으로 포함
  useEffect(() => {
    detectRef.current = async () => {
      if (!isRunningRef.current || !videoRef.current || !faceApiRef.current)
        return;

      const video = videoRef.current;
      if (video.paused || video.ended || video.readyState < 2) {
        if (isRunningRef.current) {
          rafRef.current = requestAnimationFrame(detectRef.current);
        }
        return;
      }

      // throttle: DETECTION_INTERVAL_MS 미만이면 추론 건너뜀
      const now = performance.now();
      if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
        if (isRunningRef.current) {
          rafRef.current = requestAnimationFrame(detectRef.current);
        }
        return;
      }
      lastDetectionTimeRef.current = now;

      // 리사이즈 canvas 초기화 (최초 1회)
      if (!resizeCanvasRef.current) {
        resizeCanvasRef.current = document.createElement('canvas');
        resizeCanvasRef.current.width = RESIZE_WIDTH;
        resizeCanvasRef.current.height = RESIZE_HEIGHT;
      }
      const resizeCanvas = resizeCanvasRef.current;
      const resizeCtx = resizeCanvas.getContext('2d');

      try {
        const faceapi = faceApiRef.current;

        // 추론 입력: 320×240으로 축소한 canvas 사용
        let inputSource: HTMLVideoElement | HTMLCanvasElement = video;
        let scaleX = 1;
        let scaleY = 1;

        if (resizeCtx && video.videoWidth > 0 && video.videoHeight > 0) {
          resizeCtx.drawImage(video, 0, 0, RESIZE_WIDTH, RESIZE_HEIGHT);
          inputSource = resizeCanvas;
          scaleX = video.videoWidth / RESIZE_WIDTH;
          scaleY = video.videoHeight / RESIZE_HEIGHT;
        }

        const detections = await faceapi
          .detectAllFaces(
            inputSource,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }),
          )
          .withFaceLandmarks()
          .withAgeAndGender();

        // async 완료 후 cleanup 여부 재확인 — 버그 3 수정
        if (!isRunningRef.current) return;

        const rawFaces: RawFaceDetection[] = detections.map((d) => ({
          bbox: {
            // 리사이즈 canvas 기준 좌표를 원본 비디오 좌표로 스케일 복원
            x: d.detection.box.x * scaleX,
            y: d.detection.box.y * scaleY,
            width: d.detection.box.width * scaleX,
            height: d.detection.box.height * scaleY,
          },
          age: d.age,
          gender: d.gender as 'male' | 'female',
          genderProbability: d.genderProbability,
          landmarks: d.landmarks.positions.map((p) => ({
            x: p.x * scaleX,
            y: p.y * scaleY,
          })),
        }));

        const timestamp = performance.now();
        const { activeFaces, completedFaces } = trackerRef.current.update(
          rawFaces,
          timestamp,
        );
        setFaceResults(activeFaces);

        // 트래킹이 종료된 얼굴만 DB에 저장 (동일 인물 = 1건)
        for (const face of completedFaces) {
          saveFaceAnalysisLog({
            sessionId: sessionIdRef.current,
            timestamp: Date.now(),
            trackingId: face.trackingId,
            gender: face.smoothedGender,
            age: Math.round(face.smoothedAge),
            presenceTime: face.presenceTime,
            gazeTime: face.gazeTime,
          }).catch((error: unknown) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[face-analysis] DB 저장 실패:', error);
            }
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[face-analysis] 추론 실패:', error);
        }
      }

      if (isRunningRef.current) {
        rafRef.current = requestAnimationFrame(detectRef.current);
      }
    };
  }, [videoRef, setFaceResults]);

  // 활성화/비활성화 제어 — enabled만 의존하여 detect 참조 변경에 의한 재실행 방지
  useEffect(() => {
    if (!enabled) {
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      // 비활성화 시 현재 활성 트랙을 저장 후 초기화
      const remaining = trackerRef.current.reset();
      for (const face of remaining) {
        saveFaceAnalysisLog({
          sessionId: sessionIdRef.current,
          timestamp: Date.now(),
          trackingId: face.trackingId,
          gender: face.smoothedGender,
          age: Math.round(face.smoothedAge),
          presenceTime: face.presenceTime,
          gazeTime: face.gazeTime,
        }).catch((error: unknown) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[face-analysis] DB 저장 실패(cleanup):', error);
          }
        });
      }
      setFaceResults([]);
      return;
    }

    let cancelled = false;

    loadFaceApi()
      .then((faceapi) => {
        if (cancelled) return;
        faceApiRef.current = faceapi;
        isRunningRef.current = true;
        detectRef.current();
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[face-analysis] 모델 로드 실패:', error);
        }
      });

    // cleanup 내부에서 ref.current를 직접 참조하면 ESLint react-hooks/exhaustive-deps 경고 발생
    // — effect 실행 시점에 지역 변수로 캡처하여 cleanup에서 안전하게 사용
    const tracker = trackerRef.current;
    const sessionId = sessionIdRef.current;

    return () => {
      cancelled = true;
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      // unmount 또는 enabled 재설정 시 현재 활성 트랙 저장
      const remaining = tracker.reset();
      for (const face of remaining) {
        saveFaceAnalysisLog({
          sessionId,
          timestamp: Date.now(),
          trackingId: face.trackingId,
          gender: face.smoothedGender,
          age: Math.round(face.smoothedAge),
          presenceTime: face.presenceTime,
          gazeTime: face.gazeTime,
        }).catch((error: unknown) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[face-analysis] DB 저장 실패(cleanup):', error);
          }
        });
      }
    };
  }, [enabled, setFaceResults]);
}
