import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageResultGallery } from '@/components/image-analysis/image-result-gallery';
import { useDetectionStore } from '@/stores/detection-store';

// ImageResultCard는 Canvas API를 사용하므로 mock 처리
vi.mock('@/components/image-analysis/image-result-card', () => ({
  ImageResultCard: ({ result }: { result: { id: string } }) => (
    <div data-testid={`result-card-${result.id}`} />
  ),
}));

describe('ImageResultGallery', () => {
  beforeEach(() => {
    useDetectionStore.getState().reset();
  });

  it('결과가 없으면 아무것도 렌더하지 않음', () => {
    const { container } = render(<ImageResultGallery />);
    expect(container.firstChild).toBeNull();
  });

  it('결과가 있으면 개수와 전체 삭제 버튼 표시', () => {
    useDetectionStore.setState({
      imageAnalysisResults: [
        {
          id: 'result-1',
          file: new File([''], 'a.jpg', { type: 'image/jpeg' }),
          imageUrl: 'blob:http://localhost/a',
          detections: [],
          inferenceTime: 30,
          analyzedAt: Date.now(),
        },
        {
          id: 'result-2',
          file: new File([''], 'b.jpg', { type: 'image/jpeg' }),
          imageUrl: 'blob:http://localhost/b',
          detections: [],
          inferenceTime: 20,
          analyzedAt: Date.now(),
        },
      ],
    });

    render(<ImageResultGallery />);

    expect(screen.getByText('분석 결과 (2장)')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '전체 삭제' }),
    ).toBeInTheDocument();
  });
});
