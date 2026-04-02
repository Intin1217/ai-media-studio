import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from '@/components/dashboard/settings-panel';

const mockDetectionState = {
  modelStatus: 'ready' as const,
};

vi.mock('@/stores/detection-store', () => ({
  useDetectionStore: (selector: (s: typeof mockDetectionState) => unknown) =>
    selector(mockDetectionState),
}));

// SidebarBrowserAiTab / SidebarLocalAiTab은 별도 테스트에서 커버하므로 mock
vi.mock('@/components/dashboard/sidebar-browser-ai-tab', () => ({
  SidebarBrowserAiTab: () => (
    <div data-testid="browser-ai-tab-content">브라우저 AI 탭</div>
  ),
}));

vi.mock('@/components/dashboard/sidebar-local-ai-tab', () => ({
  SidebarLocalAiTab: () => (
    <div data-testid="local-ai-tab-content">로컬 AI 탭</div>
  ),
}));

describe('SettingsPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockDetectionState.modelStatus = 'ready';
  });

  describe('렌더링 — 닫힌 상태', () => {
    it('isOpen=false이면 translate-x-full 클래스를 가진다', () => {
      render(<SettingsPanel isOpen={false} onClose={mockOnClose} />);
      const panel = screen.getByRole('complementary', { name: '설정 패널' });
      expect(panel.className).toContain('translate-x-full');
    });
  });

  describe('렌더링 — 열린 상태', () => {
    it('isOpen=true이면 translate-x-0 클래스를 가진다', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      const panel = screen.getByRole('complementary', { name: '설정 패널' });
      expect(panel.className).toContain('translate-x-0');
    });

    it('"설정" 제목이 렌더링된다', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument();
    });

    it('닫기 버튼이 렌더링된다', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      expect(
        screen.getByRole('button', { name: '설정 패널 닫기' }),
      ).toBeInTheDocument();
    });

    it('탭 3개가 렌더링된다', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('button', { name: '일반' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '브라우저 AI' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '로컬 AI' }),
      ).toBeInTheDocument();
    });
  });

  describe('탭 전환', () => {
    it('기본 탭은 일반이다 (modelStatus 표시)', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('감지 모델 상태')).toBeInTheDocument();
    });

    it('modelStatus가 ready이면 "준비됨"을 표시한다', () => {
      mockDetectionState.modelStatus = 'ready';
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('준비됨')).toBeInTheDocument();
    });

    it('modelStatus가 loading이면 "로딩 중..."을 표시한다', () => {
      mockDetectionState.modelStatus = 'loading';
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('브라우저 AI 탭 클릭 시 해당 콘텐츠가 렌더링된다', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      await user.click(screen.getByRole('button', { name: '브라우저 AI' }));
      expect(screen.getByTestId('browser-ai-tab-content')).toBeInTheDocument();
    });

    it('로컬 AI 탭 클릭 시 해당 콘텐츠가 렌더링된다', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      await user.click(screen.getByRole('button', { name: '로컬 AI' }));
      expect(screen.getByTestId('local-ai-tab-content')).toBeInTheDocument();
    });
  });

  describe('닫기 인터랙션', () => {
    it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
      await user.click(screen.getByRole('button', { name: '설정 패널 닫기' }));
      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });
});
