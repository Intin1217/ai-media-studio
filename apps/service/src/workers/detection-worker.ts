/// <reference lib="webworker" />

/**
 * Detection Worker
 *
 * WASM 백엔드로 TF.js 추론을 메인 스레드와 분리하여 실행합니다.
 * WebGL 백엔드는 Worker 환경에서 불안정하므로 WASM 백엔드를 사용합니다.
 *
 * 메시지 프로토콜:
 *   → { type: 'load' }
 *   ← { type: 'loaded' } | { type: 'error', message: string }
 *
 *   → { type: 'detect', bitmap: ImageBitmap, maxBoxes: number, threshold: number }
 *   ← { type: 'result', detections: DetectionResult[], inferenceTime: number }
 *      | { type: 'error', message: string }
 *
 *   → { type: 'dispose' }
 *   ← (응답 없음, Worker 종료)
 */

export interface DetectionResult {
  class: string;
  score: number;
  bbox: { x: number; y: number; width: number; height: number };
}

type WorkerInMessage =
  | { type: 'load' }
  | {
      type: 'detect';
      bitmap: ImageBitmap;
      maxBoxes: number;
      threshold: number;
    }
  | { type: 'dispose' };

type WorkerOutMessage =
  | { type: 'loaded' }
  | { type: 'result'; detections: DetectionResult[]; inferenceTime: number }
  | { type: 'error'; message: string };

type CocoSsdModel = {
  detect: (
    input: ImageBitmap | HTMLCanvasElement,
    maxNumBoxes?: number,
    minScore?: number,
  ) => Promise<
    Array<{
      class: string;
      score: number;
      bbox: [number, number, number, number];
    }>
  >;
};

let model: CocoSsdModel | null = null;

async function loadModel(): Promise<void> {
  try {
    // WASM 백엔드 로딩 — Worker 환경에서 안정적으로 동작
    await import('@tensorflow/tfjs-backend-wasm');
    const tf = await import('@tensorflow/tfjs-core');
    await tf.setBackend('wasm');
    await tf.ready();

    const cocoSsd = await import('@tensorflow-models/coco-ssd');
    model = (await cocoSsd.load({ base: 'mobilenet_v2' })) as CocoSsdModel;

    const msg: WorkerOutMessage = { type: 'loaded' };
    self.postMessage(msg);
  } catch (err) {
    const msg: WorkerOutMessage = {
      type: 'error',
      message: err instanceof Error ? err.message : 'Worker 모델 로딩 실패',
    };
    self.postMessage(msg);
  }
}

async function runDetection(
  bitmap: ImageBitmap,
  maxBoxes: number,
  threshold: number,
): Promise<void> {
  if (!model) {
    const msg: WorkerOutMessage = {
      type: 'error',
      message: '모델이 아직 로드되지 않았습니다',
    };
    self.postMessage(msg);
    return;
  }

  try {
    // OffscreenCanvas에 bitmap 그리기 → COCO-SSD에 전달
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('OffscreenCanvas 2D context를 가져올 수 없습니다');
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const startTime = performance.now();
    // COCO-SSD는 OffscreenCanvas를 직접 지원하지 않으므로
    // HTMLCanvasElement로 캐스팅 (동일한 인터페이스, WASM 백엔드에서 동작)
    const predictions = await model.detect(
      canvas as unknown as HTMLCanvasElement,
      maxBoxes,
      threshold,
    );
    const inferenceTime = performance.now() - startTime;

    const detections: DetectionResult[] = predictions.map((p) => ({
      class: p.class,
      score: p.score,
      bbox: {
        x: p.bbox[0],
        y: p.bbox[1],
        width: p.bbox[2],
        height: p.bbox[3],
      },
    }));

    const msg: WorkerOutMessage = {
      type: 'result',
      detections,
      inferenceTime,
    };
    self.postMessage(msg);
  } catch (err) {
    const msg: WorkerOutMessage = {
      type: 'error',
      message: err instanceof Error ? err.message : '추론 실패',
    };
    self.postMessage(msg);
  }
}

self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const data = event.data;

  switch (data.type) {
    case 'load':
      loadModel();
      break;

    case 'detect':
      runDetection(data.bitmap, data.maxBoxes, data.threshold);
      break;

    case 'dispose':
      model = null;
      self.close();
      break;
  }
};
