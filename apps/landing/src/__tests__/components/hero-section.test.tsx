import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { HeroSection } from '../../components/hero-section';

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

describe('HeroSection', () => {
  describe('기본 렌더링', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<HeroSection />)).not.toThrow();
    });

    it('section에 id="hero"가 있다', () => {
      render(<HeroSection />);
      expect(document.getElementById('hero')).toBeInTheDocument();
    });

    it('section에 aria-label="히어로 섹션"이 있다', () => {
      render(<HeroSection />);
      expect(
        screen.getByRole('region', { name: '히어로 섹션' }),
      ).toBeInTheDocument();
    });
  });

  describe('h1 heading', () => {
    it('h1 요소가 렌더링된다', () => {
      render(<HeroSection />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('h1이 "AI로 영상을 분석하는" 텍스트를 포함한다', () => {
      render(<HeroSection />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'AI로 영상을 분석하는',
      );
    });

    it('h1이 "스마트한" 텍스트를 포함한다', () => {
      render(<HeroSection />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        '스마트한',
      );
    });
  });

  describe('CTA 링크', () => {
    it('"지금 시작하기" 링크가 렌더링된다', () => {
      render(<HeroSection />);
      expect(
        screen.getByRole('link', { name: '지금 시작하기' }),
      ).toBeInTheDocument();
    });

    it('"자세히 보기" 링크가 렌더링된다', () => {
      render(<HeroSection />);
      expect(
        screen.getByRole('link', { name: '자세히 보기' }),
      ).toBeInTheDocument();
    });

    it('"자세히 보기" 링크가 #features를 가리킨다', () => {
      render(<HeroSection />);
      expect(screen.getByRole('link', { name: '자세히 보기' })).toHaveAttribute(
        'href',
        '#features',
      );
    });

    it('"지금 시작하기" 링크가 /service를 가리킨다', () => {
      render(<HeroSection />);
      const link = screen.getByRole('link', { name: '지금 시작하기' });
      expect(link).toHaveAttribute('href', '/service');
    });
  });

  describe('장식 요소 접근성', () => {
    it('장식용 blob 요소에 aria-hidden="true"가 있다', () => {
      const { container } = render(<HeroSection />);
      // aria-hidden="true"인 div 장식 요소들 확인
      const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('부가 텍스트', () => {
    it('서비스 설명 문구가 렌더링된다', () => {
      render(<HeroSection />);
      expect(
        screen.getByText(/웹캠 하나로 실시간 객체 감지부터 통계 시각화까지/),
      ).toBeInTheDocument();
    });
  });
});
