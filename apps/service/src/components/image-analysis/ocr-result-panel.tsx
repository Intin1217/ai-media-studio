'use client';

import { useState } from 'react';
import {
  createOcrEngine,
  recognizeImage,
  terminateEngine,
} from '@ai-media-studio/ocr';
import type { OcrResult } from '@ai-media-studio/ocr';

interface OcrResultPanelProps {
  imageUrl: string;
  onOcrComplete?: (result: OcrResult) => void;
}

export function OcrResultPanel({
  imageUrl,
  onOcrComplete,
}: OcrResultPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleOcrRun() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      await createOcrEngine();

      // blob: 또는 data: scheme만 허용 (SSRF 방지)
      const isAllowedUrl =
        imageUrl.startsWith('blob:') || imageUrl.startsWith('data:');
      if (!isAllowedUrl) {
        throw new Error('허용되지 않는 이미지 URL입니다');
      }

      // data URL이면 그대로 사용, blob URL이면 Blob으로 변환
      let image: string | Blob = imageUrl;
      if (imageUrl.startsWith('blob:')) {
        const res = await fetch(imageUrl);
        image = await res.blob();
      }

      const ocrResult = await recognizeImage(image);
      setResult(ocrResult);
      onOcrComplete?.(ocrResult);
    } catch {
      setError('텍스트 추출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      await terminateEngine();
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 실패 시 무시
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleOcrRun}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                className="h-3 w-3 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              추출 중...
            </>
          ) : (
            '텍스트 추출'
          )}
        </button>

        {result && !loading && (
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-500/20"
          >
            {copied ? '복사됨' : '복사'}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {result && !error && (
        <div className="bg-muted/50 mt-2 rounded-md p-2">
          {result.confidence >= 0 && (
            <p className="text-muted-foreground mb-1 text-xs">
              신뢰도: {result.confidence.toFixed(1)}%
            </p>
          )}
          <p className="text-foreground whitespace-pre-wrap text-xs leading-relaxed">
            {result.text || '추출된 텍스트가 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
}
