import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import type { OcrBlock, OcrOptions, OcrResult } from './types';

let worker: Worker | null = null;
let currentLanguage: string | null = null;
let initializingPromise: Promise<void> | null = null;

export async function createOcrEngine(language = 'kor+eng'): Promise<void> {
  if (worker && currentLanguage === language) return;

  if (initializingPromise) {
    await initializingPromise;
    if (worker && currentLanguage === language) return;
  }

  initializingPromise = (async () => {
    await terminateEngine();
    try {
      worker = await createWorker(language);
      currentLanguage = language;
    } catch (err) {
      worker = null;
      currentLanguage = null;
      throw new Error(
        `OCR Worker 초기화 실패: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  })();

  try {
    await initializingPromise;
  } finally {
    initializingPromise = null;
  }
}

export async function recognizeImage(
  image: File | Blob | string,
  options?: OcrOptions,
): Promise<OcrResult> {
  const language = options?.language ?? 'kor+eng';

  if (!worker || currentLanguage !== language) {
    await createOcrEngine(language);
  }

  if (!worker) {
    throw new Error('OCR Worker가 초기화되지 않았습니다');
  }

  const startTime = performance.now();

  try {
    const { data } = await worker.recognize(image);
    const processingTime = Math.round(performance.now() - startTime);

    const blocks: OcrBlock[] = (data.blocks ?? []).map((block) => ({
      text: block.text,
      confidence: block.confidence,
      bbox: {
        x: block.bbox.x0,
        y: block.bbox.y0,
        width: block.bbox.x1 - block.bbox.x0,
        height: block.bbox.y1 - block.bbox.y0,
      },
    }));

    return {
      text: data.text,
      confidence: data.confidence,
      blocks,
      language,
      processingTime,
    };
  } catch (err) {
    throw new Error(
      `이미지 인식 실패: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export async function terminateEngine(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
    currentLanguage = null;
  }
}
