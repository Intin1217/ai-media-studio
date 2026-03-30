import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OcrResultPanel } from '@/components/image-analysis/ocr-result-panel';

vi.mock('@ai-media-studio/ocr', () => ({
  createOcrEngine: vi.fn().mockResolvedValue(undefined),
  recognizeImage: vi.fn().mockResolvedValue({
    text: '테스트 텍스트',
    confidence: 90,
    blocks: [],
    language: 'kor+eng',
    processingTime: 500,
  }),
  terminateEngine: vi.fn().mockResolvedValue(undefined),
}));

describe('OcrResultPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('"텍스트 추출" 버튼이 렌더링됨', () => {
    render(<OcrResultPanel imageUrl="data:image/png;base64,abc" />);
    expect(
      screen.getByRole('button', { name: '텍스트 추출' }),
    ).toBeInTheDocument();
  });

  it('버튼 클릭 시 createOcrEngine과 recognizeImage가 호출됨', async () => {
    const { createOcrEngine, recognizeImage } =
      await import('@ai-media-studio/ocr');

    render(<OcrResultPanel imageUrl="data:image/png;base64,abc" />);
    fireEvent.click(screen.getByRole('button', { name: '텍스트 추출' }));

    await waitFor(() => {
      expect(createOcrEngine).toHaveBeenCalled();
      expect(recognizeImage).toHaveBeenCalled();
    });
  });

  it('OCR 완료 후 결과 텍스트가 표시됨', async () => {
    render(<OcrResultPanel imageUrl="data:image/png;base64,abc" />);
    fireEvent.click(screen.getByRole('button', { name: '텍스트 추출' }));

    await waitFor(() => {
      expect(screen.getByText('테스트 텍스트')).toBeInTheDocument();
    });
  });

  it('OCR 완료 후 신뢰도가 표시됨', async () => {
    render(<OcrResultPanel imageUrl="data:image/png;base64,abc" />);
    fireEvent.click(screen.getByRole('button', { name: '텍스트 추출' }));

    await waitFor(() => {
      expect(screen.getByText(/신뢰도:/)).toBeInTheDocument();
    });
  });

  it('OCR 완료 후 "복사" 버튼이 나타남', async () => {
    render(<OcrResultPanel imageUrl="data:image/png;base64,abc" />);
    fireEvent.click(screen.getByRole('button', { name: '텍스트 추출' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '복사' })).toBeInTheDocument();
    });
  });

  it('onOcrComplete 콜백이 결과와 함께 호출됨', async () => {
    const onOcrComplete = vi.fn();
    render(
      <OcrResultPanel
        imageUrl="data:image/png;base64,abc"
        onOcrComplete={onOcrComplete}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '텍스트 추출' }));

    await waitFor(() => {
      expect(onOcrComplete).toHaveBeenCalledWith(
        expect.objectContaining({ text: '테스트 텍스트' }),
      );
    });
  });

  it('OCR 실패 시 에러 메시지가 표시됨', async () => {
    const { recognizeImage } = await import('@ai-media-studio/ocr');
    vi.mocked(recognizeImage).mockRejectedValueOnce(new Error('인식 실패'));

    render(<OcrResultPanel imageUrl="data:image/png;base64,abc" />);
    fireEvent.click(screen.getByRole('button', { name: '텍스트 추출' }));

    await waitFor(() => {
      expect(
        screen.getByText('텍스트 추출에 실패했습니다. 다시 시도해주세요.'),
      ).toBeInTheDocument();
    });
  });
});
