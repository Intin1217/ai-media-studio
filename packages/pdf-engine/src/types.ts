export interface PdfPage {
  pageNumber: number;
  width: number;
  height: number;
  textBlocks: TextBlock[];
  isImageBased: boolean; // 이미지 기반 PDF인지 (OCR 필요 여부)
}

export interface TextBlock {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
}

export interface TranslatedBlock extends TextBlock {
  originalText: string;
  translatedText: string;
  translatedHeight: number; // pretext로 계산된 번역 후 텍스트 높이
}

export interface PdfParseResult {
  totalPages: number;
  pages: PdfPage[];
  metadata: PdfMetadata;
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creationDate?: string;
}
