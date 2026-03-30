import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { extractTextBlocks } from './text-extractor';
import type { PdfMetadata, PdfPage, PdfParseResult } from './types';

// 브라우저 환경에서 pdfjs Worker를 CDN으로 설정
// 번들러에 포함하지 않고 런타임에 로드해서 초기 번들 크기를 줄임
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

/**
 * PDF 파일을 파싱해서 페이지별 텍스트 블록과 메타데이터를 반환한다.
 * 브라우저 환경 전용 (File API 사용)
 *
 * @param file - 파싱할 PDF 파일
 * @returns 파싱 결과 (페이지, 텍스트 블록, 메타데이터)
 * @throws 파일이 PDF가 아니거나 100MB를 초과할 경우 에러
 */
export async function parsePdf(file: File): Promise<PdfParseResult> {
  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `파일 크기가 너무 큽니다. 최대 100MB까지 지원합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    );
  }

  // MIME 타입 검증
  if (file.type !== 'application/pdf') {
    throw new Error(
      `PDF 파일만 지원합니다. (현재 파일 타입: ${file.type || '알 수 없음'})`,
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  let doc: PDFDocumentProxy;

  try {
    doc = await loadingTask.promise;
  } catch {
    // pdfjs가 던지는 에러는 파일 손상 등을 포함하므로 사용자 친화적 메시지로 래핑
    throw new Error(
      'PDF를 불러오는 데 실패했습니다. 파일이 손상되었거나 올바른 PDF가 아닐 수 있습니다.',
    );
  }

  const totalPages = doc.numPages;
  const pages: PdfPage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pdfPage = await doc.getPage(pageNum);
    const viewport = pdfPage.getViewport({ scale: 1.0 });
    const textBlocks = await extractTextBlocks(pdfPage);

    pages.push({
      pageNumber: pageNum,
      width: viewport.width,
      height: viewport.height,
      textBlocks,
      // 텍스트 블록이 5개 미만이면 이미지 기반 PDF로 판단
      isImageBased: textBlocks.length < 5,
    });
  }

  const metadata = await extractMetadata(doc);

  return { totalPages, pages, metadata };
}

/**
 * PDF 문서에서 메타데이터를 추출한다.
 */
async function extractMetadata(doc: PDFDocumentProxy): Promise<PdfMetadata> {
  try {
    const meta = await doc.getMetadata();
    const info = meta.info as Record<string, string> | undefined;

    return {
      title: info?.['Title'],
      author: info?.['Author'],
      subject: info?.['Subject'],
      creationDate: info?.['CreationDate'],
    };
  } catch {
    // 메타데이터 추출 실패는 치명적이지 않으므로 빈 객체 반환
    return {};
  }
}
