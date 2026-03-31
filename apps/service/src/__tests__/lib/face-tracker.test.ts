import { describe, it, expect, beforeEach } from 'vitest';
import { FaceTracker } from '@/lib/face-tracker';

describe('FaceTracker', () => {
  let tracker: FaceTracker;

  beforeEach(() => {
    tracker = new FaceTracker();
  });

  describe('tracking ID 부여', () => {
    it('첫 감지 시 새 ID를 부여한다', () => {
      const { activeFaces } = tracker.update(
        [
          {
            bbox: { x: 100, y: 100, width: 50, height: 50 },
            age: 25,
            gender: 'male',
            genderProbability: 0.9,
            landmarks: [],
          },
        ],
        0,
      );
      expect(activeFaces).toHaveLength(1);
      expect(activeFaces[0]!.trackingId).toBeDefined();
    });

    it('비슷한 위치의 얼굴은 같은 ID를 유지한다', () => {
      const face1 = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      const face2 = {
        bbox: { x: 105, y: 102, width: 50, height: 50 },
        age: 27,
        gender: 'male' as const,
        genderProbability: 0.85,
        landmarks: [],
      };
      const { activeFaces: result1 } = tracker.update([face1], 0);
      const { activeFaces: result2 } = tracker.update([face2], 100);
      expect(result2[0]!.trackingId).toBe(result1[0]!.trackingId);
    });

    it('멀리 떨어진 얼굴은 새 ID를 부여한다', () => {
      const face1 = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      const face2 = {
        bbox: { x: 500, y: 500, width: 50, height: 50 },
        age: 30,
        gender: 'female' as const,
        genderProbability: 0.95,
        landmarks: [],
      };
      const { activeFaces: result1 } = tracker.update([face1], 0);
      const { activeFaces: result2 } = tracker.update([face2], 100);
      expect(result2[0]!.trackingId).not.toBe(result1[0]!.trackingId);
    });
  });

  describe('시간 평활화', () => {
    it('나이가 이동평균으로 안정화된다', () => {
      const baseFace = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      for (let i = 0; i < 20; i++) {
        tracker.update([{ ...baseFace, age: 25 }], i * 33);
      }
      const { activeFaces: result } = tracker.update(
        [{ ...baseFace, age: 35 }],
        21 * 33,
      );
      expect(result[0]!.smoothedAge).toBeLessThan(28);
      expect(result[0]!.smoothedAge).toBeGreaterThan(24);
    });

    it('성별이 다수결로 안정화된다', () => {
      const baseFace = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        landmarks: [],
      };
      for (let i = 0; i < 15; i++) {
        tracker.update(
          [{ ...baseFace, gender: 'male' as const, genderProbability: 0.8 }],
          i * 33,
        );
      }
      for (let i = 15; i < 20; i++) {
        tracker.update(
          [{ ...baseFace, gender: 'female' as const, genderProbability: 0.6 }],
          i * 33,
        );
      }
      const { activeFaces: result } = tracker.update(
        [{ ...baseFace, gender: 'female' as const, genderProbability: 0.6 }],
        20 * 33,
      );
      expect(result[0]!.smoothedGender).toBe('male');
    });
  });

  describe('체류/응시 시간', () => {
    it('연속 감지 시 체류 시간이 누적된다', () => {
      const face = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      tracker.update([face], 0);
      tracker.update([face], 500);
      const { activeFaces: result } = tracker.update([face], 1000);
      expect(result[0]!.presenceTime).toBe(1000);
    });

    it('2~3프레임 미감지는 끊김으로 처리하지 않는다', () => {
      const face = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      tracker.update([face], 0);
      tracker.update([face], 100);
      tracker.update([], 200);
      tracker.update([], 300);
      const { activeFaces: result } = tracker.update([face], 400);
      expect(result[0]!.presenceTime).toBe(400);
    });

    it('긴 미감지 후에는 새 트래킹으로 처리한다', () => {
      const face = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      const { activeFaces: result1 } = tracker.update([face], 0);
      for (let t = 1000; t <= 5000; t += 1000) {
        tracker.update([], t);
      }
      const { activeFaces: result2 } = tracker.update([face], 6000);
      expect(result2[0]!.trackingId).not.toBe(result1[0]!.trackingId);
      expect(result2[0]!.presenceTime).toBe(0);
    });
  });

  describe('reset', () => {
    it('모든 트래킹 상태를 초기화한다', () => {
      const face = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      tracker.update([face], 0);
      tracker.reset();
      const { activeFaces: result } = tracker.update([face], 100);
      expect(result[0]!.presenceTime).toBe(0);
    });

    it('reset()은 현재 활성 트랙을 반환한다', () => {
      const face = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      tracker.update([face], 0);
      const remaining = tracker.reset();
      expect(remaining).toHaveLength(1);
      expect(remaining[0]!.trackingId).toBeDefined();
    });

    it('reset() 후 tracker는 빈 상태가 된다', () => {
      const face = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      tracker.update([face], 0);
      tracker.reset();
      const { activeFaces } = tracker.update([], 100);
      expect(activeFaces).toHaveLength(0);
    });
  });

  describe('completedFaces', () => {
    it('stale 판정된 트랙은 completedFaces에 포함된다', () => {
      const face = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      const { activeFaces: initial } = tracker.update([face], 0);
      const initialId = initial[0]!.trackingId;
      // STALE_TIMEOUT(3000ms) 초과
      const { completedFaces } = tracker.update([], 5000);
      expect(completedFaces).toHaveLength(1);
      expect(completedFaces[0]!.trackingId).toBe(initialId);
    });

    it('활성 트랙은 completedFaces에 포함되지 않는다', () => {
      const face = {
        bbox: { x: 100, y: 100, width: 50, height: 50 },
        age: 25,
        gender: 'male' as const,
        genderProbability: 0.9,
        landmarks: [],
      };
      tracker.update([face], 0);
      const { completedFaces } = tracker.update([face], 100);
      expect(completedFaces).toHaveLength(0);
    });
  });
});
