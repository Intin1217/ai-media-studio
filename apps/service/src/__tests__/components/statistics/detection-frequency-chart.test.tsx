import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetectionFrequencyChart } from '@/components/statistics/detection-frequency-chart';
import type { DetectionLog } from '@/lib/db';

// Recharts는 jsdom 환경에서 SVG 렌더링이 불가 — 단순 div로 mock
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Cell: () => null,
}));

const buildLog = (
  detections: Array<{ class: string; score: number }>,
): DetectionLog => ({
  sessionId: 'session-1',
  timestamp: Date.now(),
  detections,
  fps: 30,
  inferenceTime: 20,
});

describe('DetectionFrequencyChart', () => {
  describe('데이터 없을 때', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<DetectionFrequencyChart logs={[]} />)).not.toThrow();
    });

    it('"데이터가 없습니다" 빈 상태 메시지가 표시된다', () => {
      render(<DetectionFrequencyChart logs={[]} />);
      expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
    });

    it('차트가 렌더링되지 않는다', () => {
      render(<DetectionFrequencyChart logs={[]} />);
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('데이터 있을 때', () => {
    const logs = [
      buildLog([
        { class: 'person', score: 0.95 },
        { class: 'car', score: 0.87 },
        { class: 'person', score: 0.82 },
      ]),
      buildLog([{ class: 'dog', score: 0.78 }]),
    ];

    it('에러 없이 렌더링된다', () => {
      expect(() =>
        render(<DetectionFrequencyChart logs={logs} />),
      ).not.toThrow();
    });

    it('BarChart가 렌더링된다', () => {
      render(<DetectionFrequencyChart logs={logs} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('빈 상태 메시지가 표시되지 않는다', () => {
      render(<DetectionFrequencyChart logs={logs} />);
      expect(screen.queryByText('데이터가 없습니다')).not.toBeInTheDocument();
    });
  });

  describe('타이틀', () => {
    it('"객체별 감지 빈도" 타이틀이 렌더링된다', () => {
      render(<DetectionFrequencyChart logs={[]} />);
      expect(screen.getByText('객체별 감지 빈도')).toBeInTheDocument();
    });
  });
});
