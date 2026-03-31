export interface HeadPose {
  yaw: number; // 좌우 회전 (도)
  pitch: number; // 상하 회전 (도)
}

/**
 * 68-point 얼굴 랜드마크에서 head pose를 추정합니다.
 *
 * 핵심 포인트 인덱스:
 * - 0: 왼쪽 귀, 16: 오른쪽 귀 (얼굴 너비 기준)
 * - 36: 왼눈, 45: 오른눈
 * - 30: 코끝
 * - 8: 턱
 *
 * Yaw: (코끝 x - 양눈 중심 x) / 얼굴 너비 * 45
 * Pitch: (코끝 y - 눈 중심 y) / (턱 y - 눈 중심 y) * 45 - 기준 비율 보정
 */
export function estimateHeadPose(
  landmarks: { x: number; y: number }[],
): HeadPose {
  const noseTip = landmarks[30]!;
  const leftEye = landmarks[36]!;
  const rightEye = landmarks[45]!;
  const chin = landmarks[8]!;
  const leftEar = landmarks[0]!;
  const rightEar = landmarks[16]!;

  // 양눈 중심 계산
  const eyeCenterX = (leftEye.x + rightEye.x) / 2;
  const eyeCenterY = (leftEye.y + rightEye.y) / 2;

  // 얼굴 너비 (귀 기준)
  const faceWidth = Math.abs(rightEar.x - leftEar.x);

  // Yaw: 코끝이 양눈 중심으로부터 수평으로 얼마나 치우쳤는지
  // 얼굴 너비의 절반 대비 비율로 정규화 후 × 90
  const horizontalOffset = noseTip.x - eyeCenterX;
  const faceHalfWidth = faceWidth / 2;
  const yaw = faceHalfWidth > 0 ? (horizontalOffset / faceHalfWidth) * 45 : 0;

  // 눈 중심 ~ 턱까지 수직 거리 (얼굴 높이 기준)
  const eyeToChinDistance = chin.y - eyeCenterY;

  // Pitch: 코끝의 수직 위치를 눈-턱 거리 비율로 정규화
  // 정면 기준 코끝은 눈-턱 구간의 약 1/3 지점에 위치
  const FRONTAL_NOSE_RATIO = 1 / 3;
  const noseVerticalOffset = noseTip.y - eyeCenterY;
  const noseRatio =
    eyeToChinDistance > 0 ? noseVerticalOffset / eyeToChinDistance : 0;
  const pitch = (noseRatio - FRONTAL_NOSE_RATIO) * 90;

  return { yaw, pitch };
}

/**
 * 시선이 카메라를 향하고 있는지 판단합니다.
 *
 * @param pose - estimateHeadPose의 반환값
 * @param threshold - yaw/pitch 허용 범위 (도), 기본값 20
 */
export function isLookingAtCamera(pose: HeadPose, threshold = 20): boolean {
  return Math.abs(pose.yaw) <= threshold && Math.abs(pose.pitch) <= threshold;
}
