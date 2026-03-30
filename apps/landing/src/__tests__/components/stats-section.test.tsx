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
  });

  describe('섹션 heading', () => {
    it('h2 heading이 존재한다', () => {
      render(<StatsSection />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('h2 heading의 id가 "stats-heading"이다', () => {
      render(<StatsSection />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'stats-heading');
    });

    it('h2 heading이 올바른 텍스트를 갖는다', () => {
      render(<StatsSection />);
      expect(
        screen.getByRole('heading', { name: '숫자로 증명하는 성능' }),
      ).toBeInTheDocument();
    });

    it('"성능 지표" 레이블 텍스트가 렌더링된다', () => {
      render(<StatsSection />);
      expect(screen.getByText('성능 지표')).toBeInTheDocument();
    });
  });

  describe('통계 카드', () => {
    it('3개의 통계 카드가 렌더링된다', () => {
      render(<StatsSection />);
      expect(screen.getByText('외부 데이터 전송')).toBeInTheDocument();
      expect(screen.getByText('감지 가능 객체')).toBeInTheDocument();
      expect(screen.getByText('API 비용')).toBeInTheDocument();
    });

    it('외부 데이터 전송 카드의 suffix "건"이 렌더링된다', () => {
      render(<StatsSection />);
      expect(screen.getByText('건')).toBeInTheDocument();
    });

    it('감지 가능 객체 카드의 suffix "+"가 렌더링된다', () => {
      render(<StatsSection />);
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('API 비용 카드의 suffix "원"이 렌더링된다', () => {
      render(<StatsSection />);
      expect(screen.getByText('원')).toBeInTheDocument();
    });

    it('각 카드의 설명 텍스트가 렌더링된다', () => {
      render(<StatsSection />);
      expect(screen.getByText('모든 처리가 로컬에서 완결')).toBeInTheDocument();
      expect(
        screen.getByText('COCO-SSD, MediaPipe로 정확한 인식'),
      ).toBeInTheDocument();
      expect(screen.getByText('로컬 실행으로 완전 무료')).toBeInTheDocument();
    });
  });
});
