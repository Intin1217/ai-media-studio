import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetectionList } from '@/components/detection/detection-list';
import { useDetectionStore } from '@/stores/detection-store';

describe('DetectionList', () => {
  beforeEach(() => {
    useDetectionStore.getState().reset();
  });

  it('감지 결과가 없을 때 빈 메시지 표시', () => {
    render(<DetectionList />);
    expect(screen.getByText('감지된 객체가 없습니다')).toBeInTheDocument();
  });

  it('감지 결과를 목록으로 표시', () => {
    useDetectionStore.getState().setDetections([
      {
        class: 'person',
        score: 0.95,
        bbox: { x: 0, y: 0, width: 100, height: 200 },
      },
      {
        class: 'car',
        score: 0.8,
        bbox: { x: 50, y: 50, width: 150, height: 100 },
      },
    ]);
    render(<DetectionList />);
    expect(screen.getByText('person')).toBeInTheDocument();
    expect(screen.getByText('car')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });
});
