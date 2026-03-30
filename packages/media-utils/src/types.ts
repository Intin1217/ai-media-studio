export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  class: string;
  score: number;
  bbox: BoundingBox;
}

export interface DrawOptions {
  colorMap?: Record<string, string>;
  lineWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  defaultColor?: string;
  labelFormatter?: (className: string) => string;
}

export interface WebcamConfig {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
}
