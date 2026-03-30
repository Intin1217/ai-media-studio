import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Header } from '../../components/header';

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

describe('Header', () => {
  describe('기본 렌더링', () => {
    it('에러 없이 렌더링된다', () => {
      expect(() => render(<Header />)).not.toThrow();
    });

    it('브랜드명 "AI Media Studio"가 표시된다', () => {
      render(<Header />);
      // 로고 링크의 aria-label로도 접근 가능하고, 텍스트로도 확인
      expect(screen.getByText('AI Media Studio')).toBeInTheDocument();
    });

    it('로고 링크에 접근 가능한 aria-label이 있다', () => {
      render(<Header />);
      const logoLink = screen.getByRole('link', {
        name: 'AI Media Studio 홈으로 이동',
      });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('로고 SVG 아이콘에 aria-hidden="true"가 있다', () => {
      render(<Header />);
      // 로고 링크 안의 SVG를 찾음
      const logoLink = screen.getByRole('link', {
        name: 'AI Media Studio 홈으로 이동',
      });
      const svg = logoLink.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('데스크톱 네비게이션', () => {
    it('주요 탐색 nav에 aria-label="주요 탐색"이 있다', () => {
      render(<Header />);
      expect(
        screen.getByRole('navigation', { name: '주요 탐색' }),
      ).toBeInTheDocument();
    });

    it('네비게이션 링크 "기능"이 #features를 가리킨다', () => {
      render(<Header />);
      // 데스크톱과 모바일 모두 렌더링될 수 있으므로 getAllByRole 사용
      const links = screen.getAllByRole('link', { name: '기능' });
      expect(links[0]).toHaveAttribute('href', '#features');
    });

    it('네비게이션 링크 "사용법"이 #how-it-works를 가리킨다', () => {
      render(<Header />);
      const links = screen.getAllByRole('link', { name: '사용법' });
      expect(links[0]).toHaveAttribute('href', '#how-it-works');
    });

    it('네비게이션 링크 "기술 스택"이 #tech-stack을 가리킨다', () => {
      render(<Header />);
      const links = screen.getAllByRole('link', { name: '기술 스택' });
      expect(links[0]).toHaveAttribute('href', '#tech-stack');
    });
  });

  describe('모바일 메뉴 토글', () => {
    it('초기 상태에서 모바일 메뉴 버튼에 aria-expanded="false"가 있다', () => {
      render(<Header />);
      const menuButton = screen.getByRole('button', { name: '메뉴 열기' });
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('모바일 메뉴 버튼을 클릭하면 메뉴가 열린다', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: '메뉴 열기' });
      await user.click(menuButton);

      expect(
        screen.getByRole('navigation', { name: '모바일 탐색' }),
      ).toBeInTheDocument();
    });

    it('메뉴가 열린 상태에서 버튼 aria-label이 "메뉴 닫기"로 변경된다', async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: '메뉴 열기' }));

      expect(
        screen.getByRole('button', { name: '메뉴 닫기' }),
      ).toBeInTheDocument();
    });

    it('메뉴가 열린 상태에서 aria-expanded="true"가 된다', async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: '메뉴 열기' }));

      const closeButton = screen.getByRole('button', { name: '메뉴 닫기' });
      expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('모바일 메뉴의 버튼에 aria-controls="mobile-menu"가 있다', () => {
      render(<Header />);
      const menuButton = screen.getByRole('button', { name: '메뉴 열기' });
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    });
  });
});
