import { describe, it, expect } from 'vitest';
import { estimateHeadPose, isLookingAtCamera } from '@/lib/gaze-estimator';

// 68-point 랜드마크 좌표 배열 생성 (정면 기준)
// 얼굴 너비 200px, 눈 y=150, 코끝 y=200, 턱 y=300 기준
function createFrontalLandmarks(): { x: number; y: number }[] {
  const landmarks = Array.from({ length: 68 }, () => ({ x: 0, y: 0 }));

  // 핵심 포인트 설정 (정면 대칭)
  // 왼쪽 귀(0), 오른쪽 귀(16): 얼굴 좌우 끝
  landmarks[0] = { x: 100, y: 160 };
  landmarks[16] = { x: 300, y: 160 };

  // 턱(8): 얼굴 하단 중앙
  landmarks[8] = { x: 200, y: 300 };

  // 왼눈(36), 오른눈(45): 눈 위치
  landmarks[36] = { x: 140, y: 150 };
  landmarks[45] = { x: 260, y: 150 };

  // 코끝(30): 양눈 중심 바로 아래 (정면이므로 수평 중앙)
  landmarks[30] = { x: 200, y: 200 };

  return landmarks;
}

// 코끝을 수평 방향으로 이동 (좌우 회전 시뮬레이션)
function shiftNoseHorizontally(
  landmarks: { x: number; y: number }[],
  dx: number,
): { x: number; y: number }[] {
  const shifted = landmarks.map((p) => ({ ...p }));
  shifted[30] = { x: landmarks[30].x + dx, y: landmarks[30].y };
  return shifted;
}

// 코끝을 수직 방향으로 이동 (상하 회전 시뮬레이션)
function shiftNoseVertically(
  landmarks: { x: number; y: number }[],
  dy: number,
): { x: number; y: number }[] {
  const shifted = landmarks.map((p) => ({ ...p }));
  shifted[30] = { x: landmarks[30].x, y: landmarks[30].y + dy };
  return shifted;
}

describe('estimateHeadPose', () => {
  const frontalLandmarks = createFrontalLandmarks();

  it('정면 응시 시 yaw/pitch가 0에 가까워야 한다', () => {
    const pose = estimateHeadPose(frontalLandmarks);
    expect(Math.abs(pose.yaw)).toBeLessThan(5);
    expect(Math.abs(pose.pitch)).toBeLessThan(5);
  });

  it('왼쪽을 보면 yaw가 음수여야 한다', () => {
    const leftLandmarks = shiftNoseHorizontally(frontalLandmarks, -30);
    const pose = estimateHeadPose(leftLandmarks);
    expect(pose.yaw).toBeLessThan(-10);
  });

  it('오른쪽을 보면 yaw가 양수여야 한다', () => {
    const rightLandmarks = shiftNoseHorizontally(frontalLandmarks, 30);
    const pose = estimateHeadPose(rightLandmarks);
    expect(pose.yaw).toBeGreaterThan(10);
  });

  it('아래를 보면 pitch가 양수여야 한다', () => {
    const downLandmarks = shiftNoseVertically(frontalLandmarks, 20);
    const pose = estimateHeadPose(downLandmarks);
    expect(pose.pitch).toBeGreaterThan(10);
  });

  it('위를 보면 pitch가 음수여야 한다', () => {
    const upLandmarks = shiftNoseVertically(frontalLandmarks, -20);
    const pose = estimateHeadPose(upLandmarks);
    expect(pose.pitch).toBeLessThan(-10);
  });

  it('HeadPose 타입으로 yaw와 pitch를 반환한다', () => {
    const pose = estimateHeadPose(frontalLandmarks);
    expect(pose).toHaveProperty('yaw');
    expect(pose).toHaveProperty('pitch');
    expect(typeof pose.yaw).toBe('number');
    expect(typeof pose.pitch).toBe('number');
  });
});

describe('isLookingAtCamera', () => {
  it('yaw/pitch 모두 ±20도 이내면 true', () => {
    expect(isLookingAtCamera({ yaw: 10, pitch: -5 })).toBe(true);
  });

  it('yaw가 ±20도 초과하면 false', () => {
    expect(isLookingAtCamera({ yaw: 25, pitch: 0 })).toBe(false);
  });

  it('pitch가 ±20도 초과하면 false', () => {
    expect(isLookingAtCamera({ yaw: 0, pitch: -25 })).toBe(false);
  });

  it('커스텀 임계값을 적용할 수 있다', () => {
    expect(isLookingAtCamera({ yaw: 20, pitch: 0 }, 25)).toBe(true);
  });

  it('경계값 정확히 threshold와 같으면 true', () => {
    expect(isLookingAtCamera({ yaw: 20, pitch: 20 })).toBe(true);
  });

  it('경계값 threshold를 1도 초과하면 false', () => {
    expect(isLookingAtCamera({ yaw: 20.1, pitch: 0 })).toBe(false);
  });
});
