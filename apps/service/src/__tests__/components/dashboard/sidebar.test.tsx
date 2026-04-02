import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar, NAV_ITEMS } from '@/components/dashboard/sidebar';

const mockSetDashboardTab = vi.fn();

const mockState = {
  dashboardTab: 'realtime' as const,
  setDashboardTab: mockSetDashboardTab,
};

vi.mock('@/stores/detection-store', () => ({
  useDetectionStore: (selector: (s: typeof mockState) => unknown) =>
    selector(mockState),
}));

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button type="button" aria-label="테마 전환" />,
}));

describe('Sidebar (52px Icon-only)', () => {
  const mockOnSettingsToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockState.dashboardTab = 'realtime';
  });

  describe('NAV_ITEMS export', () => {
    it('NAV_ITEMS가 4개 항목을 가진다', () => {
      expect(NAV_ITEMS).toHaveLength(4);
    });

    it('NAV_ITEMS의 id가 올바르다', () => {
      const ids = NAV_ITEMS.map((item) => item.id);
      expect(ids).toContain('realtime');
      expect(ids).toContain('image-analysis');
      expect(ids).toContain('statistics');
      expect(ids).toContain('pdf');
    });

    it('각 항목에 label과 icon이 있다', () => {
      for (const item of NAV_ITEMS) {
        expect(item.label).toBeTruthy();
        expect(item.icon).toBeTruthy();
      }
    });
  });

  describe('기본 렌더링', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() =>
        render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />),
      ).not.toThrow();
    });

    it('aside 요소로 렌더링된다', () => {
      render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('로고 "AI" 텍스트가 렌더링된다', () => {
      render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />);
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('설정 버튼이 렌더링된다', () => {
      render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />);
      expect(
        screen.getByRole('button', { name: '설정 패널 열기' }),
      ).toBeInTheDocument();
    });
  });

  describe('네비게이션 아이콘', () => {
    it('4개의 네비게이션 버튼이 렌더링된다', () => {
      render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />);
      const nav = screen.getByRole('navigation', { name: '메인 네비게이션' });
      const buttons = nav.querySelectorAll('button');
      expect(buttons).toHaveLength(4);
    });

    it('각 버튼에 aria-label이 있다', () => {
      render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />);
      for (const item of NAV_ITEMS) {
        expect(
          screen.getByRole('button', { name: item.label }),
        ).toBeInTheDocument();
      }
    });

    it('활성 탭 버튼에 aria-current="page"가 있다', () => {
      mockState.dashboardTab = 'realtime';
      render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />);
      const activeButton = screen.getByRole('button', { name: '실시간 감지' });
      expect(activeButton).toHaveAttribute('aria-current', 'page');
    });

    it('비활성 탭 버튼에 aria-current가 없다', () => {
      mockState.dashboardTab = 'realtime';
      render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />);
      const inactiveButton = screen.getByRole('button', {
        name: '이미지 분석',
      });
      expect(inactiveButton).not.toHaveAttribute('aria-current');
    });

    it('네비게이션 버튼 클릭 시 setDashboardTab이 호출된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />);
      await user.click(screen.getByRole('button', { name: '이미지 분석' }));
      expect(mockSetDashboardTab).toHaveBeenCalledWith('image-analysis');
    });
  });

  describe('설정 버튼', () => {
    it('설정 버튼 클릭 시 onSettingsToggle이 호출된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar onSettingsToggle={mockOnSettingsToggle} />);
      await user.click(screen.getByRole('button', { name: '설정 패널 열기' }));
      expect(mockOnSettingsToggle).toHaveBeenCalledOnce();
    });
  });
});
