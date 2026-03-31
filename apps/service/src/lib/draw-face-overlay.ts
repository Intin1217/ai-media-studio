export interface TrackedFace {
  trackingId: string;
  bbox: { x: number; y: number; width: number; height: number };
  age: number;
  smoothedAge: number;
  gender: 'male' | 'female';
  smoothedGender: 'male' | 'female';
  genderProbability: number;
  isLooking: boolean;
  presenceTime: number; // ms
  gazeTime: number; // ms
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getGenderLabel(gender: 'male' | 'female'): string {
  return gender === 'male' ? '남성' : '여성';
}

const BBOX_COLOR = '#00FFAA';
const GAZE_COLOR_ON = '#00FF88';
const GAZE_COLOR_OFF = '#FF6B6B';
const LABEL_BG = 'rgba(0,0,0,0.7)';
const FONT = '12px monospace';
const LINE_HEIGHT = 16;
const PADDING = 4;
const INDICATOR_RADIUS = 6;

export function drawFaceOverlay(
  ctx: CanvasRenderingContext2D,
  faces: TrackedFace[],
): void {
  for (const face of faces) {
    ctx.save();

    const { x, y, width, height } = face.bbox;

    // 1. 바운딩 박스
    ctx.strokeStyle = BBOX_COLOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // 2 & 3. 라벨 배경 + 텍스트
    const lines = [
      `${getGenderLabel(face.smoothedGender)}, ${Math.round(face.smoothedAge)}세`,
      `체류 ${formatTime(face.presenceTime)}`,
      `응시 ${formatTime(face.gazeTime)}`,
    ];

    ctx.font = FONT;
    const labelWidth =
      Math.max(...lines.map((line) => ctx.measureText(line).width)) +
      PADDING * 2;
    const labelHeight = lines.length * LINE_HEIGHT + PADDING * 2;
    const labelX = x;
    const labelY = y - labelHeight;

    ctx.fillStyle = LABEL_BG;
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => {
      ctx.fillText(line, labelX + PADDING, labelY + PADDING + i * LINE_HEIGHT);
    });

    // 4. 응시 인디케이터 (바운딩 박스 우상단)
    const indicatorX = x + width;
    const indicatorY = y;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, INDICATOR_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = face.isLooking ? GAZE_COLOR_ON : GAZE_COLOR_OFF;
    ctx.fill();

    ctx.restore();
  }
}
