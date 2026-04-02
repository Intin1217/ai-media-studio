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
        screen.getByRole('heading', {
          name: '브라우저에서 완결되는 AI 분석',
        }),
      ).toBeInTheDocument();
    });

    it('"핵심 기능" Eyebrow 텍스트가 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('핵심 기능')).toBeInTheDocument();
    });
  });

  describe('기능 항목', () => {
    it('4개의 기능 heading(h3)이 렌더링된다', () => {
      render(<FeaturesSection />);
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements).toHaveLength(4);
    });

    it('"실시간 객체 감지" 기능이 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByRole('heading', { name: '실시간 객체 감지' }),
      ).toBeInTheDocument();
    });

    it('"얼굴 분석" 기능이 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByRole('heading', { name: '얼굴 분석' }),
      ).toBeInTheDocument();
    });

    it('"PDF 번역" 기능이 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByRole('heading', { name: 'PDF 번역' }),
      ).toBeInTheDocument();
    });

    it('"이미지 분석 OCR" 기능이 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByRole('heading', { name: '이미지 분석 OCR' }),
      ).toBeInTheDocument();
    });

    it('각 기능의 설명 텍스트가 렌더링된다', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText(/80종 이상의 객체를 30fps로/),
      ).toBeInTheDocument();
      expect(screen.getByText(/성별·나이 추정, 시선 추적/)).toBeInTheDocument();
      expect(screen.getByText(/레이아웃을 보존하면서/)).toBeInTheDocument();
      expect(
        screen.getByText(/이미지에서 텍스트를 추출하고/),
      ).toBeInTheDocument();
    });
  });
});
