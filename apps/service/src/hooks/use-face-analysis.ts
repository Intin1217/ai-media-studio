import { useCallback, useEffect, useRef } from 'react';
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

const LOG_INTERVAL_MS = 5000;

interface UseFaceAnalysisOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useFaceAnalysis({ videoRef }: UseFaceAnalysisOptions): void {
  const enabled = useSettingsStore((s) => s.faceAnalysisEnabled);
  const setFaceResults = useDetectionStore((s) => s.setFaceAnalysisResults);

  const trackerRef = useRef(new FaceTracker());
  const rafRef = useRef<number>(0);
  const isRunningRef = useRef(false);
  const faceApiRef = useRef<FaceApiModule | null>(null);
  const lastLogTimeRef = useRef<number>(0);

  const detect = useCallback(async () => {
    if (!isRunningRef.current || !videoRef.current || !faceApiRef.current)
      return;

    const video = videoRef.current;
    if (video.paused || video.ended || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      const faceapi = faceApiRef.current;
      const detections = await faceapi
        .detectAllFaces(
          video,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
        )
        .withFaceLandmarks()
        .withAgeAndGender();

      const rawFaces: RawFaceDetection[] = detections.map((d) => ({
        bbox: {
          x: d.detection.box.x,
          y: d.detection.box.y,
          width: d.detection.box.width,
          height: d.detection.box.height,
        },
        age: d.age,
        gender: d.gender as 'male' | 'female',
        genderProbability: d.genderProbability,
        landmarks: d.landmarks.positions.map((p) => ({ x: p.x, y: p.y })),
      }));

      const now = performance.now();
      const tracked = trackerRef.current.update(rawFaces, now);
      setFaceResults(tracked);

      // 5초 간격으로 감지된 각 얼굴을 DB 저장
      if (
        tracked.length > 0 &&
        now - lastLogTimeRef.current >= LOG_INTERVAL_MS
      ) {
        lastLogTimeRef.current = now;
        const logTimestamp = Date.now();
        Promise.all(
          tracked.map((f) =>
            saveFaceAnalysisLog({
              sessionId: 'face-analysis',
              timestamp: logTimestamp,
              trackingId: f.trackingId,
              gender: f.smoothedGender,
              age: Math.round(f.smoothedAge),
              presenceTime: f.presenceTime,
              gazeTime: f.gazeTime,
            }),
          ),
        ).catch((error: unknown) => {
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
      rafRef.current = requestAnimationFrame(detect);
    }
  }, [videoRef, setFaceResults]);

  useEffect(() => {
    if (!enabled) {
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      trackerRef.current.reset();
      setFaceResults([]);
      return;
    }

    let cancelled = false;

    loadFaceApi()
      .then((faceapi) => {
        if (cancelled) return;
        faceApiRef.current = faceapi;
        isRunningRef.current = true;
        detect();
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[face-analysis] 모델 로드 실패:', error);
        }
      });

    return () => {
      cancelled = true;
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, detect, setFaceResults]);
}
