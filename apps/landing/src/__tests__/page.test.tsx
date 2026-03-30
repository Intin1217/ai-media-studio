import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import LandingPage from '../app/page';

// IntersectionObserver는 jsdom에 없으므로 mock 처리
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

// next/link는 jsdom 환경에서 기본 <a> 태그로 렌더링됨
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('LandingPage', () => {
  describe('페이지 기본 구조', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<LandingPage />)).not.toThrow();
    });

    it('<main id="main-content"> 요소가 존재한다', () => {
      render(<LandingPage />);
      const main = document.getElementById('main-content');
      expect(main).toBeInTheDocument();
      expect(main?.tagName).toBe('MAIN');
    });

    it('h1 요소가 존재하고 올바른 텍스트를 포함한다', () => {
      render(<LandingPage />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('내 컴퓨터에서 실행하는');
    });
  });

  describe('섹션 존재 여부', () => {
    it('hero 섹션이 렌더링된다', () => {
      render(<LandingPage />);
      expect(document.getElementById('hero')).toBeInTheDocument();
    });

    it('features 섹션이 렌더링된다', () => {
      render(<LandingPage />);
      expect(document.getElementById('features')).toBeInTheDocument();
    });

    it('how-it-works 섹션이 렌더링된다', () => {
      render(<LandingPage />);
      expect(document.getElementById('how-it-works')).toBeInTheDocument();
    });

    it('tech-stack 섹션이 렌더링된다', () => {
      render(<LandingPage />);
      expect(document.getElementById('tech-stack')).toBeInTheDocument();
    });

    it('CTA 섹션이 렌더링된다', () => {
      render(<LandingPage />);
      // CtaSection은 id가 없으므로 고유 heading 텍스트로 확인
      expect(
        screen.getByRole('heading', {
          name: '지금 내 컴퓨터에 설치해 보세요',
        }),
      ).toBeInTheDocument();
    });

    it('footer가 렌더링된다', () => {
      render(<LandingPage />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('heading 계층 구조', () => {
    it('h1이 정확히 1개 존재한다', () => {
      render(<LandingPage />);
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
    });

    it('h2 heading들이 h1 다음 레벨로 존재한다 (건너뛰기 없음)', () => {
      render(<LandingPage />);
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      // features, how-it-works, tech-stack, cta 섹션 각각 1개씩
      expect(h2Elements.length).toBeGreaterThanOrEqual(4);
    });

    it('features 섹션 heading이 올바른 텍스트를 갖는다', () => {
      render(<LandingPage />);
      expect(
        screen.getByRole('heading', { name: '강력하고 직관적인 AI 분석' }),
      ).toBeInTheDocument();
    });

    it('how-it-works 섹션 heading이 올바른 텍스트를 갖는다', () => {
      render(<LandingPage />);
      expect(
        screen.getByRole('heading', { name: '3단계로 시작하는 AI 분석' }),
      ).toBeInTheDocument();
    });

    it('tech-stack 섹션 heading이 올바른 텍스트를 갖는다', () => {
      render(<LandingPage />);
      expect(
        screen.getByRole('heading', { name: '검증된 최신 기술로 구축' }),
      ).toBeInTheDocument();
    });
  });

  describe('CTA 버튼 접근성', () => {
    it('"설치 가이드" CTA 링크가 존재한다', () => {
      render(<LandingPage />);
      const ctaLinks = screen.getAllByRole('link', { name: /설치 가이드/i });
      expect(ctaLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('"자세히 보기" 링크가 존재하고 #features를 가리킨다', () => {
      render(<LandingPage />);
      const link = screen.getByRole('link', { name: '자세히 보기' });
      expect(link).toHaveAttribute('href', '#features');
    });

    it('"GitHub에서 설치하기" CTA 링크가 존재한다', () => {
      render(<LandingPage />);
      expect(
        screen.getByRole('link', { name: 'GitHub에서 설치하기' }),
      ).toBeInTheDocument();
    });
  });
});
