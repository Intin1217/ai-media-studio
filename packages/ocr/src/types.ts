export interface OcrResult {
  text: string;
  confidence: number; // 0-100, Ollama인 경우 -1
  blocks: OcrBlock[];
  language: string;
  processingTime: number; // ms
}

export interface OcrBlock {
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface OcrOptions {
  language?: string; // 기본: 'kor+eng'
  mode?: 'tesseract' | 'ollama'; // 기본: 'tesseract'
}
