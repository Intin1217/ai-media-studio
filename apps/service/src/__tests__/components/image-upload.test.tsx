import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageUpload } from '@/components/image-analysis/image-upload';
import { useDetectionStore } from '@/stores/detection-store';

vi.mock('@/hooks/use-image-detector', () => ({
  useImageDetector: () => ({
    analyzeImage: vi.fn(),
    analyzeMultipleImages: vi.fn(),
  }),
}));

describe('ImageUpload', () => {
  beforeEach(() => {
    useDetectionStore.getState().reset();
  });

  it('모델 미로딩 시 비활성 상태', () => {
    // modelStatus 기본값이 'idle'
    render(<ImageUpload />);

    const dropzone = screen.getByRole('button');
    expect(dropzone.className).toContain('opacity-50');
    expect(dropzone.className).toContain('cursor-not-allowed');
  });

  it('모델 로딩 완료 시 업로드 텍스트 표시', () => {
    useDetectionStore.getState().setModelStatus('ready');
    render(<ImageUpload />);

    expect(
      screen.getByText('이미지를 드래그하거나 클릭하여 업로드'),
    ).toBeInTheDocument();
  });
});
