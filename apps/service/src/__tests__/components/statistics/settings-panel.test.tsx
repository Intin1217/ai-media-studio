import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from '@/components/statistics/settings-panel';

// useSettingsStore mock — 실제 Zustand persist는 jsdom의 localStorage에 의존하므로
// 격리된 mock으로 대체한다
const mockSetConfidenceThreshold = vi.fn();
const mockSetBboxColor = vi.fn();
const mockResetBboxColors = vi.fn();

vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: (selector: (s: unknown) => unknown) =>
    selector({
      confidenceThreshold: 0.5,
      bboxColors: {},
      setConfidenceThreshold: mockSetConfidenceThreshold,
      setBboxColor: mockSetBboxColor,
      resetBboxColors: mockResetBboxColors,
    }),
}));

describe('SettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<SettingsPanel />)).not.toThrow();
    });

    it('"설정" 타이틀이 렌더링된다', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('설정')).toBeInTheDocument();
    });
  });

  describe('슬라이더', () => {
    it('신뢰도 임계값 레이블이 렌더링된다', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('감지 신뢰도 임계값')).toBeInTheDocument();
    });

    it('현재 임계값(50%)이 표시된다', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('슬라이더 input이 렌더링된다', () => {
      render(<SettingsPanel />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('색상 선택기', () => {
    it('"바운딩 박스 색상" 레이블이 렌더링된다', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('바운딩 박스 색상')).toBeInTheDocument();
    });

    it('기본 객체 클래스 레이블들이 렌더링된다', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('person')).toBeInTheDocument();
      expect(screen.getByText('car')).toBeInTheDocument();
      expect(screen.getByText('dog')).toBeInTheDocument();
      expect(screen.getByText('cat')).toBeInTheDocument();
    });

    it('color input이 6개 렌더링된다', () => {
      const { container } = render(<SettingsPanel />);
      const colorInputs = container.querySelectorAll('input[type="color"]');
      expect(colorInputs).toHaveLength(6);
    });

    it('색상 변경 시 setBboxColor가 호출된다', async () => {
      const user = userEvent.setup();
      const { container } = render(<SettingsPanel />);

      const colorInput = container.querySelector(
        'input[type="color"]',
      ) as HTMLInputElement;
      await user.click(colorInput);
      // color input 값 변경 이벤트를 직접 fire
      colorInput.value = '#FF0000';
      colorInput.dispatchEvent(new Event('change', { bubbles: true }));

      expect(mockSetBboxColor).toHaveBeenCalled();
    });
  });

  describe('초기화 버튼', () => {
    it('초기화 버튼이 렌더링된다', () => {
      render(<SettingsPanel />);
      expect(
        screen.getByRole('button', { name: '초기화' }),
      ).toBeInTheDocument();
    });

    it('초기화 클릭 시 resetBboxColors가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      await user.click(screen.getByRole('button', { name: '초기화' }));

      expect(mockResetBboxColors).toHaveBeenCalledOnce();
    });
  });
});
