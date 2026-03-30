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

  it('unique 모드에서 고유 감지 카운트를 내림차순으로 표시', () => {
    // statsMode 기본값이 'unique'이므로 uniqueDetectionCounts에 직접 설정
    useDetectionStore.setState({
      uniqueDetectionCounts: { person: 2, car: 1 },
    });

    render(<DetectionStats />);

    // 한국어 라벨로 표시됨
    expect(screen.getByText('사람')).toBeInTheDocument();
    expect(screen.getByText('자동차')).toBeInTheDocument();

    // person(사람)이 2회로 더 많으니 먼저 표시
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('사람');
  });

  it('per-second 모드에서 초당 카운트 표시', () => {
    useDetectionStore.getState().setStatsMode('per-second');
    useDetectionStore.setState({
      perSecondCounts: { bicycle: 3, dog: 1 },
    });

    render(<DetectionStats />);

    // 한국어 라벨로 표시됨
    expect(screen.getByText('자전거')).toBeInTheDocument();
    expect(screen.getByText('강아지')).toBeInTheDocument();

    // 단위 suffix 확인
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('자전거');
    expect(items[0]).toHaveTextContent('개/초');
  });

  it('current-frame 모드에서 현재 프레임 감지 표시', () => {
    useDetectionStore.getState().setStatsMode('current-frame');
    useDetectionStore.setState({
      detections: [
        {
          class: 'cat',
          score: 0.95,
          bbox: { x: 0, y: 0, width: 1, height: 1 },
        },
        {
          class: 'cat',
          score: 0.88,
          bbox: { x: 10, y: 10, width: 1, height: 1 },
        },
        {
          class: 'bird',
          score: 0.7,
          bbox: { x: 20, y: 20, width: 1, height: 1 },
        },
      ],
    });

    render(<DetectionStats />);

    // 한국어 라벨로 표시됨
    expect(screen.getByText('고양이')).toBeInTheDocument();
    expect(screen.getByText('새')).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    // cat(고양이)이 2개로 더 많으니 먼저 표시
    expect(items[0]).toHaveTextContent('고양이');
    expect(items[0]).toHaveTextContent('개');
  });

  it('StatsModeSelector가 렌더됨', () => {
    render(<DetectionStats />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
