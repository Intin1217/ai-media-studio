import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatisticsView } from '@/components/statistics/statistics-view';

// Dexie/IndexedDB 기반 hook mock
vi.mock('@/hooks/use-detection-history', () => ({
  useDetectionHistory: () => ({
    logs: [],
    sessions: [],
    isLoading: false,
    refresh: vi.fn(),
    clearHistory: vi.fn(),
  }),
}));

// Recharts는 jsdom에서 SVG 렌더링 불가 — 단순 div로 대체
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Bar: () => null,
  Pie: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Cell: () => null,
}));

// Zustand persist 스토어 mock
vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: (selector: (s: unknown) => unknown) =>
    selector({
      confidenceThreshold: 0.5,
      bboxColors: {},
      setConfidenceThreshold: vi.fn(),
      setBboxColor: vi.fn(),
      resetBboxColors: vi.fn(),
    }),
}));

describe('StatisticsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<StatisticsView />)).not.toThrow();
    });
  });

  describe('기간 필터 버튼', () => {
    it('오늘 버튼이 렌더링된다', () => {
      render(<StatisticsView />);
      expect(screen.getByRole('button', { name: '오늘' })).toBeInTheDocument();
    });

    it('최근 7일 버튼이 렌더링된다', () => {
      render(<StatisticsView />);
      expect(
        screen.getByRole('button', { name: '최근 7일' }),
      ).toBeInTheDocument();
    });

    it('전체 버튼이 렌더링된다', () => {
      render(<StatisticsView />);
      expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
    });

    it('기본으로 오늘 필터가 활성화 상태(default variant)다', () => {
      render(<StatisticsView />);
      const todayBtn = screen.getByRole('button', { name: '오늘' });
      // default variant는 bg-primary 클래스를 포함한다
      expect(todayBtn.className).toMatch(/bg-primary|default/);
    });
  });

  describe('기간 필터 클릭', () => {
    it('최근 7일 버튼 클릭 시 해당 버튼이 활성 상태가 된다', async () => {
      const user = userEvent.setup();
      render(<StatisticsView />);

      const btn7days = screen.getByRole('button', { name: '최근 7일' });
      await user.click(btn7days);

      // 클릭 후 7일 버튼이 default variant(bg-primary)를 가져야 함
      expect(btn7days.className).toMatch(/bg-primary|default/);
    });

    it('전체 버튼 클릭 시 해당 버튼이 활성 상태가 된다', async () => {
      const user = userEvent.setup();
      render(<StatisticsView />);

      const btnAll = screen.getByRole('button', { name: '전체' });
      await user.click(btnAll);

      expect(btnAll.className).toMatch(/bg-primary|default/);
    });
  });

  describe('액션 버튼', () => {
    it('새로고침 버튼이 렌더링된다', () => {
      render(<StatisticsView />);
      expect(
        screen.getByRole('button', { name: '새로고침' }),
      ).toBeInTheDocument();
    });

    it('기록 삭제 버튼이 렌더링된다', () => {
      render(<StatisticsView />);
      expect(
        screen.getByRole('button', { name: '기록 삭제' }),
      ).toBeInTheDocument();
    });
  });
});
