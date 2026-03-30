'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@ai-media-studio/ui';
import { useScrollHeader } from '../hooks/use-scroll-header';
import { ThemeToggle } from './theme-toggle';

const NAV_LINKS = [
  { label: '기능', href: '#features' },
  { label: '사용법', href: '#how-it-works' },
  { label: '기술 스택', href: '#tech-stack' },
] as const;

export function Header() {
  const isScrolled = useScrollHeader();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 border-border shadow-sm backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link
          href="/"
          className="focus-visible:ring-ring flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="AI Media Studio 홈으로 이동"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-ai-cyan"
          >
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <circle cx="4" cy="8" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="20" cy="8" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="4" cy="16" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="20" cy="16" r="2" fill="currentColor" opacity="0.7" />
            <line
              x1="6"
              y1="8"
              x2="9"
              y2="11"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="18"
              y1="8"
              x2="15"
              y2="11"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="6"
              y1="16"
              x2="9"
              y2="13"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="18"
              y1="16"
              x2="15"
              y2="13"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
          </svg>
          <span className="text-foreground text-lg font-bold">
            AI Media Studio
          </span>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav
          aria-label="주요 탐색"
          className="hidden items-center gap-8 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* 데스크톱 CTA */}
        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="https://github.com/Intin1217/ai-media-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
            aria-label="GitHub"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <ThemeToggle />
          <a
            href="https://github.com/Intin1217/ai-media-studio"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm">설치하기</Button>
          </a>
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          type="button"
          className="hover:bg-muted focus-visible:ring-ring rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 lg:hidden"
          aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="12"
                x2="21"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="18"
                x2="21"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="bg-background border-border border-b lg:hidden"
        >
          <nav
            aria-label="모바일 탐색"
            className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-muted-foreground focus-visible:ring-ring rounded-sm py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
                onClick={handleNavClick}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/Intin1217/ai-media-studio"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleNavClick}
            >
              <Button className="w-full">설치하기</Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
