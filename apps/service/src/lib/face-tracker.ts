import { estimateHeadPose, isLookingAtCamera } from './gaze-estimator';

export interface RawFaceDetection {
  bbox: { x: number; y: number; width: number; height: number };
  age: number;
  gender: 'male' | 'female';
  genderProbability: number;
  landmarks: { x: number; y: number }[];
}

export interface TrackedFace {
  trackingId: string;
  bbox: { x: number; y: number; width: number; height: number };
  age: number;
  smoothedAge: number;
  gender: 'male' | 'female';
  smoothedGender: 'male' | 'female';
  genderProbability: number;
  isLooking: boolean;
  presenceTime: number;
  gazeTime: number;
}

interface TrackState {
  trackingId: string;
  bbox: { x: number; y: number; width: number; height: number };
  age: number;
  gender: 'male' | 'female';
  genderProbability: number;
  ageHistory: number[];
  genderHistory: ('male' | 'female')[];
  isLooking: boolean;
  firstSeen: number;
  lastSeen: number;
  missedFrames: number;
  gazeTime: number;
  lastGazeStart: number | null;
}

const SMOOTHING_WINDOW = 30;
const STALE_TIMEOUT = 3000;
const TRACKING_DISTANCE_THRESHOLD = 150;
const MIN_LANDMARKS_FOR_GAZE = 68;

function bboxCenter(bbox: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return {
    cx: bbox.x + bbox.width / 2,
    cy: bbox.y + bbox.height / 2,
  };
}

function euclideanDistance(
  a: { cx: number; cy: number },
  b: { cx: number; cy: number },
): number {
  return Math.sqrt((a.cx - b.cx) ** 2 + (a.cy - b.cy) ** 2);
}

function computeSmoothedAge(history: number[]): number {
  if (history.length === 0) return 0;
  return history.reduce((sum, v) => sum + v, 0) / history.length;
}

function computeSmoothedGender(
  history: ('male' | 'female')[],
): 'male' | 'female' {
  if (history.length === 0) return 'male';
  const maleCount = history.filter((g) => g === 'male').length;
  return maleCount >= history.length - maleCount ? 'male' : 'female';
}

function computeIsLooking(landmarks: { x: number; y: number }[]): boolean {
  if (landmarks.length < MIN_LANDMARKS_FOR_GAZE) return false;
  const pose = estimateHeadPose(landmarks);
  return isLookingAtCamera(pose);
}

export class FaceTracker {
  private tracks: Map<string, TrackState> = new Map();
  private idCounter = 0;

  private generateId(): string {
    return `face-${++this.idCounter}-${Date.now()}`;
  }

  private toTrackedFace(track: TrackState): TrackedFace {
    return {
      trackingId: track.trackingId,
      bbox: track.bbox,
      age: track.age,
      smoothedAge: computeSmoothedAge(track.ageHistory),
      gender: track.gender,
      smoothedGender: computeSmoothedGender(track.genderHistory),
      genderProbability: track.genderProbability,
      isLooking: track.isLooking,
      presenceTime: track.lastSeen - track.firstSeen,
      gazeTime: track.gazeTime,
    };
  }

  update(
    faces: RawFaceDetection[],
    timestamp: number,
  ): { activeFaces: TrackedFace[]; completedFaces: TrackedFace[] } {
    // 1. 기존 stale 트랙 제거 (STALE_TIMEOUT 초과) — 제거된 트랙은 completedFaces에 수집
    const completedFaces: TrackedFace[] = [];
    for (const [id, track] of this.tracks) {
      if (timestamp - track.lastSeen > STALE_TIMEOUT) {
        completedFaces.push(this.toTrackedFace(track));
        this.tracks.delete(id);
      }
    }

    // 2. 현재 트랙 목록을 배열로 변환 (매칭용)
    const activeTracks = Array.from(this.tracks.values());
    const matched = new Set<string>(); // 매칭된 trackingId
    const usedFaceIndices = new Set<number>();

    // 3. 각 기존 트랙에 대해 가장 가까운 face 매칭
    const assignments: { trackId: string; faceIndex: number }[] = [];

    for (const track of activeTracks) {
      const trackCenter = bboxCenter(track.bbox);
      let bestDist = Infinity;
      let bestIdx = -1;

      for (let i = 0; i < faces.length; i++) {
        if (usedFaceIndices.has(i)) continue;
        const faceCenter = bboxCenter(faces[i]!.bbox);
        const dist = euclideanDistance(trackCenter, faceCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }

      if (bestIdx !== -1 && bestDist <= TRACKING_DISTANCE_THRESHOLD) {
        assignments.push({ trackId: track.trackingId, faceIndex: bestIdx });
        matched.add(track.trackingId);
        usedFaceIndices.add(bestIdx);
      }
    }

    // 4. 매칭된 트랙 업데이트
    for (const { trackId, faceIndex } of assignments) {
      const track = this.tracks.get(trackId)!;
      const face = faces[faceIndex]!;

      const isLooking = computeIsLooking(face.landmarks);

      // 응시 시간 누적 (track 직접 mutation 없이 새 값으로 계산)
      const gazeStartForCalc = track.lastGazeStart ?? track.lastSeen;
      const newGazeTime = isLooking
        ? track.gazeTime + (timestamp - gazeStartForCalc)
        : track.gazeTime;
      const newLastGazeStart = isLooking ? timestamp : null;

      // 이동평균 히스토리 업데이트
      const ageHistory = [...track.ageHistory, face.age].slice(
        -SMOOTHING_WINDOW,
      );
      const genderHistory = [...track.genderHistory, face.gender].slice(
        -SMOOTHING_WINDOW,
      );

      this.tracks.set(trackId, {
        ...track,
        bbox: face.bbox,
        age: face.age,
        gender: face.gender,
        genderProbability: face.genderProbability,
        ageHistory,
        genderHistory,
        isLooking,
        lastSeen: timestamp,
        missedFrames: 0,
        gazeTime: newGazeTime,
        lastGazeStart: newLastGazeStart,
      });
    }

    // 5. 매칭 안 된 기존 트랙 — missedFrames 증가 (STALE_TIMEOUT에서 자연 제거됨)
    for (const track of activeTracks) {
      if (!matched.has(track.trackingId)) {
        this.tracks.set(track.trackingId, {
          ...track,
          missedFrames: track.missedFrames + 1,
          isLooking: false,
          lastGazeStart: null,
        });
      }
    }

    // 6. 매칭 안 된 새 face → 신규 트랙 생성
    for (let i = 0; i < faces.length; i++) {
      if (usedFaceIndices.has(i)) continue;
      const face = faces[i]!;
      const isLooking = computeIsLooking(face.landmarks);
      const newId = this.generateId();
      this.tracks.set(newId, {
        trackingId: newId,
        bbox: face.bbox,
        age: face.age,
        gender: face.gender,
        genderProbability: face.genderProbability,
        ageHistory: [face.age],
        genderHistory: [face.gender],
        isLooking,
        firstSeen: timestamp,
        lastSeen: timestamp,
        missedFrames: 0,
        gazeTime: 0,
        lastGazeStart: isLooking ? timestamp : null,
      });
    }

    // 7. 결과 반환 — 현재 프레임에서 감지된 트랙(missedFrames === 0)만 activeFaces에 포함
    const activeFaces: TrackedFace[] = [];
    for (const track of this.tracks.values()) {
      if (track.missedFrames !== 0) continue;
      activeFaces.push(this.toTrackedFace(track));
    }

    return { activeFaces, completedFaces };
  }

  reset(): TrackedFace[] {
    const remaining = Array.from(this.tracks.values()).map((track) =>
      this.toTrackedFace(track),
    );
    this.tracks.clear();
    return remaining;
  }
}
