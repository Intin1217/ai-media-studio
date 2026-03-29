import type { BoundingBox, Detection, DrawOptions } from './types';

const DEFAULT_COLOR_PALETTE: Record<string, string> = {
  person: '#00FF88',
  car: '#FF6B6B',
  dog: '#4ECDC4',
  cat: '#FFE66D',
  laptop: '#A78BFA',
  'cell phone': '#F472B6',
  bottle: '#34D399',
  chair: '#60A5FA',
};

const DEFAULT_FONT_FAMILY = '-apple-system, BlinkMacSystemFont, sans-serif';

export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function getColorForClass(
  className: string,
  colorMap?: Record<string, string>,
  defaultColor = '#FFFFFF',
): string {
  if (colorMap && colorMap[className]) {
    return colorMap[className];
  }
  return DEFAULT_COLOR_PALETTE[className] ?? defaultColor;
}

export function drawBoundingBox(
  ctx: CanvasRenderingContext2D,
  bbox: BoundingBox,
  color: string,
  lineWidth = 2,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
}

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  fontSize = 14,
): void {
  const fontFamily = DEFAULT_FONT_FAMILY;
  ctx.font = `${fontSize}px ${fontFamily}`;

  const padding = 4;
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;

  const bgX = x;
  const bgY = y - textHeight - padding * 2;
  const bgWidth = textWidth + padding * 2;
  const bgHeight = textHeight + padding * 2;

  ctx.fillStyle = color;
  ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

  ctx.fillStyle = '#000000';
  ctx.fillText(text, x + padding, y - padding);
}

export function drawDetections(
  ctx: CanvasRenderingContext2D,
  detections: Detection[],
  options: DrawOptions = {},
): void {
  const {
    colorMap,
    lineWidth = 2,
    fontSize = 14,
    defaultColor = '#FFFFFF',
  } = options;

  for (const detection of detections) {
    const color = getColorForClass(detection.class, colorMap, defaultColor);
    const label = `${detection.class} ${Math.round(detection.score * 100)}%`;

    drawBoundingBox(ctx, detection.bbox, color, lineWidth);
    drawLabel(ctx, label, detection.bbox.x, detection.bbox.y, color, fontSize);
  }
}
