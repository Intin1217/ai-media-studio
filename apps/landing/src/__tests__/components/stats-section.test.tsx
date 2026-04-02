import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { StatsSection } from '../../components/stats-section';

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(
        _callback: IntersectionObserverCallback,
        _options?: IntersectionObserverInit,
      ) {}
    },
  );

  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe('StatsSection', () => {
  describe('섹션 구조', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<StatsSection />)).not.toThrow();
    });

    it('section에 id="stats"가 있다', () => {
      render(<StatsSection />);
      expect(document.getElementById('stats')).toBeInTheDocument();
    });

    it('section에 aria-labelledby="stats-heading"이 있다', () => {
      render(<StatsSection />);
      const section = document.getElementById('stats');
      expect(section).toHaveAttribute('aria-labelledby', 'stats-heading');
    });

    it('"성능 지표" sr-only heading이 존재한다', () => {
      render(<StatsSection />);
      expect(screen.getByText('성능 지표')).toBeInTheDocument();
    });
  });

  describe('메트릭 항목', () => {
    it('4개의 메트릭 레이블이 렌더링된다', () => {
      render(<StatsSection />);
      expect(screen.getByText('감지 가능 객체')).toBeInTheDocument();
      expect(screen.getByText('실시간 처리')).toBeInTheDocument();
      expect(screen.getByText('API 비용')).toBeInTheDocument();
      expect(screen.getByText('프라이버시')).toBeInTheDocument();
    });

    it('메트릭 설명 텍스트가 렌더링된다', () => {
      render(<StatsSection />);
      expect(screen.getByText('COCO-SSD, MediaPipe')).toBeInTheDocument();
      expect(screen.getByText('브라우저 AI 엔진')).toBeInTheDocument();
      expect(screen.getByText('로컬 실행, 완전 무료')).toBeInTheDocument();
      expect(screen.getByText('서버 전송 없음')).toBeInTheDocument();
    });

    it('aria-live="polite" 카운팅 요소가 존재한다', () => {
      const { container } = render(<StatsSection />);
      const liveElements = container.querySelectorAll('[aria-live="polite"]');
      expect(liveElements.length).toBeGreaterThanOrEqual(4);
    });
  });
});
