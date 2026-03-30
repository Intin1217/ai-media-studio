import type { PDFPageProxy } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import type { TextBlock } from './types';

/**
 * PDF 페이지에서 텍스트 블록 목록을 추출한다.
 *
 * pdfjs의 TextItem은 transform 행렬로 위치를 표현한다.
 * transform = [scaleX, skewY, skewX, scaleY, translateX, translateY]
 * translateX/Y가 각각 x, y 좌표이고 scaleY의 절댓값이 fontSize에 해당한다.
 *
 * @param page - pdfjs PDFPageProxy 인스턴스
 * @returns 텍스트 블록 배열 (빈 텍스트는 제외)
 */
export async function extractTextBlocks(
  page: PDFPageProxy,
): Promise<TextBlock[]> {
  const textContent = await page.getTextContent();
  const blocks: TextBlock[] = [];

  for (const item of textContent.items) {
    // TextItem에만 str, transform이 있음 (TextMarkedContent 제외)
    if (!isTextItem(item)) continue;

    const text = item.str.trim();
    if (!text) continue;

    // transform 행렬에서 위치와 크기 추출
    // [scaleX, skewY, skewX, scaleY, x, y]
    const [, , , scaleY, x, y] = item.transform;
    const fontSize = Math.abs(scaleY);

    blocks.push({
      text,
      x,
      y,
      width: item.width,
      height: item.height,
      fontSize,
      fontFamily: item.fontName ?? '',
    });
  }

  return blocks;
}

/**
 * pdfjs TextContent 아이템이 TextItem인지 확인한다.
 * TextMarkedContent와 구분하기 위해 'str' 프로퍼티 존재 여부로 판단.
 */
function isTextItem(item: unknown): item is TextItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'str' in item &&
    'transform' in item
  );
}
