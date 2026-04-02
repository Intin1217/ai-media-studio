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

    it('h1이 "브라우저 안에서" 텍스트를 포함한다', () => {
      render(<HeroSection />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        '브라우저 안에서',
      );
    });

    it('h1이 "완결되는 AI" 텍스트를 포함한다', () => {
      render(<HeroSection />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        '완결되는 AI',
      );
    });
  });

  describe('CTA 링크', () => {
    it('"무료로 시작하기" 링크가 렌더링된다', () => {
      render(<HeroSection />);
      const links = screen.getAllByRole('link', { name: /무료로 시작하기/ });
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('"GitHub" 링크가 렌더링된다', () => {
      render(<HeroSection />);
      const links = screen.getAllByRole('link', { name: /GitHub/ });
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('"무료로 시작하기" 링크가 GitHub 레포를 가리킨다', () => {
      render(<HeroSection />);
      const links = screen.getAllByRole('link', { name: /무료로 시작하기/ });
      expect(links[0]).toHaveAttribute(
        'href',
        'https://github.com/Intin1217/ai-media-studio',
      );
    });
  });

  describe('장식 요소 접근성', () => {
    it('aria-hidden="true"인 장식 요소가 존재한다', () => {
      const { container } = render(<HeroSection />);
      const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('부가 텍스트', () => {
    it('온프레미스 설명 문구가 렌더링된다', () => {
      render(<HeroSection />);
      expect(
        screen.getByText(/웹캠 영상을 서버에 보내지 않습니다/),
      ).toBeInTheDocument();
    });

    it('Eyebrow pill "온프레미스 AI 분석"이 렌더링된다', () => {
      render(<HeroSection />);
      expect(screen.getByText('온프레미스 AI 분석')).toBeInTheDocument();
    });
  });
});
