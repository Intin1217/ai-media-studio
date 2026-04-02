import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AnimatedCounter } from '@/components/animations/animated-counter';

describe('AnimatedCounter', () => {
  beforeEach(() => {
    // requestAnimationFrame mock — 콜백을 즉시 실행
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(performance.now());
      return 0;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('초기 value를 렌더링한다', () => {
      render(<AnimatedCounter value={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('suffix를 렌더링한다', () => {
      render(<AnimatedCounter value={100} suffix="%" />);
      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it('className이 span에 적용된다', () => {
      const { container } = render(
        <AnimatedCounter value={5} className="text-sky-400" />,
      );
      const span = container.querySelector('span');
      expect(span?.className).toContain('text-sky-400');
    });
  });

  describe('prefers-reduced-motion', () => {
    it('reduced motion 환경에서 즉시 목표 값을 표시한다', async () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList);

      await act(async () => {
        render(<AnimatedCounter value={99} />);
      });

      expect(screen.getByText('99')).toBeInTheDocument();
    });
  });

  describe('값 변경', () => {
    it('value prop이 변경되면 컴포넌트가 업데이트된다', async () => {
      const { rerender } = render(<AnimatedCounter value={0} />);

      await act(async () => {
        rerender(<AnimatedCounter value={50} />);
      });

      // rAF mock이 즉시 실행되므로 최종값에 도달
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });
});
