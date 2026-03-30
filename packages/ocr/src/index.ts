export {
  createOcrEngine,
  recognizeImage,
  terminateEngine,
} from './tesseract-engine';
export { recognizeWithOllama } from './ollama-vision-ocr';
export type { OcrResult, OcrBlock, OcrOptions } from './types';
