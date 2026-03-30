import type { TranslatedBlock } from './types';
import { loadPretextModule } from './pretext-loader';

export interface LayoutOptions {
  lineHeight: number;
  font: string;
}

function parseFontSize(font: string): number {
  const match = /(\d+(?:\.\d+)?)px/.exec(font);
  return match?.[1] ? parseFloat(match[1]) : 14;
}

export function computeTextHeight(
  text: string,
  width: number,
  options?: Partial<LayoutOptions>,
): number {
  const lineHeight = options?.lineHeight ?? 1.5;
  const fontSize = parseFontSize(options?.font ?? '14px sans-serif');
  // 평균 글자 너비를 fontSize * 0.6으로 추정
  const charsPerLine = Math.max(1, Math.floor(width / (fontSize * 0.6)));
  return Math.ceil(text.length / charsPerLine) * lineHeight * fontSize;
}

export async function computeTranslatedLayouts(
  blocks: TranslatedBlock[],
  options?: Partial<LayoutOptions>,
): Promise<TranslatedBlock[]> {
  const lineHeight = options?.lineHeight ?? 1.5;
  const font = options?.font ?? '14px sans-serif';

  const pretext = await loadPretextModule();

  return blocks.map((block) => {
    let translatedHeight: number;

    if (pretext) {
      try {
        const prepared = pretext.prepare(block.translatedText);
        const layoutResult = pretext.layout(prepared, block.width, lineHeight);
        translatedHeight = layoutResult.height;
      } catch {
        translatedHeight = computeTextHeight(
          block.translatedText,
          block.width,
          {
            lineHeight,
            font,
          },
        );
      }
    } else {
      translatedHeight = computeTextHeight(block.translatedText, block.width, {
        lineHeight,
        font,
      });
    }

    return { ...block, translatedHeight };
  });
}
