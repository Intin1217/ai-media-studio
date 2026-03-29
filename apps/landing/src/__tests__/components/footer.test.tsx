import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '../../components/footer';

describe('Footer', () => {
  describe('기본 렌더링', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<Footer />)).not.toThrow();
    });

    it('<footer role="contentinfo"> 요소가 렌더링된다', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('로고 및 브랜드', () => {
    it('"AI Media Studio" 브랜드명이 표시된다', () => {
      render(<Footer />);
      expect(screen.getByText('AI Media Studio')).toBeInTheDocument();
    });

    it('로고 SVG에 aria-hidden="true"가 있다', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      const svg = footer?.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('서비스 설명 문구가 렌더링된다', () => {
      render(<Footer />);
      expect(
        screen.getByText(/웹캠으로 실시간 AI 분석을 경험하세요/),
      ).toBeInTheDocument();
    });
  });

  describe('서비스 네비게이션', () => {
    it('서비스 탐색 nav에 aria-label="서비스 탐색"이 있다', () => {
      render(<Footer />);
      expect(
        screen.getByRole('navigation', { name: '서비스 탐색' }),
      ).toBeInTheDocument();
    });

    it('"기능" 링크가 #features를 가리킨다', () => {
      render(<Footer />);
      // Footer 내의 링크만 대상으로 하기 위해 within을 사용하지 않고
      // getAllByRole로 찾은 뒤 href로 필터링
      const links = screen.getAllByRole('link', { name: '기능' });
      const footerFeatureLink = links.find(
        (link) => link.closest('footer') !== null,
      );
      expect(footerFeatureLink).toHaveAttribute('href', '#features');
    });

    it('"사용법" 링크가 #how-it-works를 가리킨다', () => {
      render(<Footer />);
      const links = screen.getAllByRole('link', { name: '사용법' });
      const footerLink = links.find((link) => link.closest('footer') !== null);
      expect(footerLink).toHaveAttribute('href', '#how-it-works');
    });

    it('"기술 스택" 링크가 #tech-stack을 가리킨다', () => {
      render(<Footer />);
      const links = screen.getAllByRole('link', { name: '기술 스택' });
      const footerLink = links.find((link) => link.closest('footer') !== null);
      expect(footerLink).toHaveAttribute('href', '#tech-stack');
    });
  });

  describe('개발자 링크 네비게이션', () => {
    it('개발자 링크 nav에 aria-label="개발자 링크"가 있다', () => {
      render(<Footer />);
      expect(
        screen.getByRole('navigation', { name: '개발자 링크' }),
      ).toBeInTheDocument();
    });

    it('GitHub 링크가 올바른 href를 갖는다', () => {
      render(<Footer />);
      const githubLink = screen.getByRole('link', { name: /GitHub/ });
      expect(githubLink).toHaveAttribute(
        'href',
        'https://github.com/Intin1217/ai-media-studio',
      );
    });

    it('GitHub 링크가 새 탭으로 열린다', () => {
      render(<Footer />);
      const githubLink = screen.getByRole('link', { name: /GitHub/ });
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('GitHub 링크에 "(새 탭에서 열림)" sr-only 텍스트가 있다', () => {
      render(<Footer />);
      const srOnlyText = screen.getByText('(새 탭에서 열림)');
      expect(srOnlyText).toBeInTheDocument();
    });
  });

  describe('저작권 및 하단 정보', () => {
    it('저작권 텍스트가 표시된다', () => {
      render(<Footer />);
      expect(
        screen.getByText('© 2026 AI Media Studio. All rights reserved.'),
      ).toBeInTheDocument();
    });

    it('"Built with Next.js, TensorFlow.js" 텍스트가 표시된다', () => {
      render(<Footer />);
      expect(
        screen.getByText('Built with Next.js, TensorFlow.js'),
      ).toBeInTheDocument();
    });
  });
});
