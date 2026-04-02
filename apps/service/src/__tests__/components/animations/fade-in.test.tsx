import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { FadeIn } from '@/components/animations/fade-in';

// jsdom에는 IntersectionObserver가 없으므로 class 기반 mock 설정
const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();

class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe = observeMock;
  unobserve = unobserveMock;
  disconnect = disconnectMock;
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

describe('FadeIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본: prefers-reduced-motion = false
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('children을 렌더링한다', () => {
      render(<FadeIn>테스트 콘텐츠</FadeIn>);
      expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
    });

    it('초기 상태에서 opacity: 0을 가진다', () => {
      const { container } = render(<FadeIn>내용</FadeIn>);
      const div = container.firstChild as HTMLElement;
      expect(div.style.opacity).toBe('0');
    });

    it('className이 div에 적용된다', () => {
      const { container } = render(
        <FadeIn className="custom-class">내용</FadeIn>,
      );
      const div = container.firstChild as HTMLElement;
      expect(div.className).toContain('custom-class');
    });
  });

  describe('prefers-reduced-motion', () => {
    it('reduced motion 환경에서 즉시 visible 상태가 된다', async () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList);

      let container: HTMLElement;
      await act(async () => {
        const result = render(<FadeIn>내용</FadeIn>);
        container = result.container;
      });

      const div = container!.firstChild as HTMLElement;
      expect(div.style.opacity).toBe('1');
    });
  });

  describe('IntersectionObserver 통합', () => {
    it('컴포넌트 마운트 시 observe가 호출된다', () => {
      render(<FadeIn>내용</FadeIn>);
      expect(observeMock).toHaveBeenCalled();
    });

    it('unmount 시 disconnect가 호출된다', () => {
      const { unmount } = render(<FadeIn>내용</FadeIn>);
      unmount();
      expect(disconnectMock).toHaveBeenCalled();
    });

    it('IntersectionObserver 진입 시 opacity가 1이 된다', async () => {
      let capturedCallback: IntersectionObserverCallback | null = null;

      class CapturingObserver {
        readonly root = null;
        readonly rootMargin = '';
        readonly thresholds: ReadonlyArray<number> = [];
        constructor(cb: IntersectionObserverCallback) {
          capturedCallback = cb;
        }
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords(): IntersectionObserverEntry[] {
          return [];
        }
      }

      vi.stubGlobal('IntersectionObserver', CapturingObserver);

      let container: HTMLElement;
      await act(async () => {
        const result = render(<FadeIn>내용</FadeIn>);
        container = result.container;
      });

      // IntersectionObserver 진입 시뮬레이션
      await act(async () => {
        capturedCallback?.(
          [
            {
              isIntersecting: true,
              target: container!.firstChild,
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        );
      });

      const div = container!.firstChild as HTMLElement;
      expect(div.style.opacity).toBe('1');
    });
  });
});
