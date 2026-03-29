import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetectionStats } from '@/components/detection/detection-stats';
import { useDetectionStore } from '@/stores/detection-store';

describe('DetectionStats', () => {
  beforeEach(() => {
    useDetectionStore.getState().reset();
  });

  it('통계가 없을 때 빈 메시지 표시', () => {
    render(<DetectionStats />);
    expect(screen.getByText('아직 통계가 없습니다')).toBeInTheDocument();
  });

  it('누적 카운트를 내림차순으로 표시', () => {
    useDetectionStore.getState().incrementDetectionCounts([
      {
        class: 'person',
        score: 0.9,
        bbox: { x: 0, y: 0, width: 1, height: 1 },
      },
      {
        class: 'person',
        score: 0.9,
        bbox: { x: 0, y: 0, width: 1, height: 1 },
      },
      { class: 'car', score: 0.9, bbox: { x: 0, y: 0, width: 1, height: 1 } },
    ]);
    render(<DetectionStats />);
    expect(screen.getByText('person')).toBeInTheDocument();
    expect(screen.getByText('car')).toBeInTheDocument();
    // person이 2회로 더 많으니 먼저 표시
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('person');
  });
});
