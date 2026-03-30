import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { FeaturesSection } from '../../components/features-section';

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
});

describe('FeaturesSection', () => {
  describe('섹션 구조', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<FeaturesSection />)).not.toThrow();
    });

    it('section에 id="features"가 있다', () => {
      render(<FeaturesSection />);
      expect(document.getElementById('features')).toBeInTheDocument();
    });

    it('section에 aria-labelledby="features-heading"이 있다', () => {
      render(<FeaturesSection />);
      const section = document.getElementById('features');
      expect(section).toHaveAttribute('aria-labelledby', 'features-heading');
    });
  });

  describe('섹션 heading', () => {
    it('h2 heading이 존재한다', () => {
      render(<FeaturesSection />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('h2 heading의 id가 "features-heading"이다', () => {
      render(<FeaturesSection />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'features-heading');
    });

    it('h2 heading이 올바른 텍스트를 갖는다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByRole('heading', { name: '강력하고 직관적인 AI 분석' }),
      ).toBeInTheDocument();
    });

    it('"주요 기능" 레이블 텍스트가 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('주요 기능')).toBeInTheDocument();
    });
  });

  describe('기능 카드', () => {
    it('4개의 기능 카드 heading(h3)이 렌더링된다', () => {
      render(<FeaturesSection />);
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements).toHaveLength(4);
    });

    it('"실시간 AI 분석" 카드가 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByRole('heading', { name: '실시간 AI 분석' }),
      ).toBeInTheDocument();
    });

    it('"완전한 프라이버시" 카드가 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByRole('heading', { name: '완전한 프라이버시' }),
      ).toBeInTheDocument();
    });

    it('"실시간 통계 대시보드" 카드가 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByRole('heading', { name: '실시간 통계 대시보드' }),
      ).toBeInTheDocument();
    });

    it('"빠른 성능" 카드가 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByRole('heading', { name: '빠른 성능' }),
      ).toBeInTheDocument();
    });

    it('각 카드의 설명 텍스트가 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText(/TensorFlow\.js가 실시간으로 분석합니다/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/모든 데이터가 브라우저 내에서 처리됩니다/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/감지된 객체를 실시간 차트와 통계로 시각화합니다/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/WebGL 가속을 활용한 최적화된 추론 엔진/),
      ).toBeInTheDocument();
    });
  });

  describe('아이콘 접근성', () => {
    it('기능 카드 SVG 아이콘에 aria-hidden="true"가 있다', () => {
      const { container } = render(<FeaturesSection />);
      // 기능 아이콘 SVG들은 모두 aria-hidden="true" 여야 함
      const svgElements = container.querySelectorAll('svg[aria-hidden="true"]');
      // 4개 카드 각각 1개 아이콘
      expect(svgElements.length).toBeGreaterThanOrEqual(4);
    });
  });
});
