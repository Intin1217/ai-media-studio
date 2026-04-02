'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollHeader } from '../hooks/use-scroll-header';

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
    <>
      <header className="fixed left-0 right-0 top-0 z-40 flex justify-center px-4 pt-4">
        <nav
          aria-label="주요 탐색"
          className={`flex items-center gap-6 rounded-full px-6 py-3 transition-all duration-500 ${
            isScrolled
              ? 'bg-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/15 backdrop-blur-xl'
              : 'bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-md'
          }`}
          style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="AI Media Studio 홈으로 이동"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-sky-500"
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
            <span className="text-foreground hidden text-sm font-semibold sm:inline">
              AI Media Studio
            </span>
          </Link>

          {/* 데스크톱 네비 링크 */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* 데스크톱 CTA */}
          <div className="hidden items-center gap-2 border-l border-white/10 pl-2 lg:flex">
            <a
              href="https://github.com/Intin1217/ai-media-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground rounded-full p-1.5 transition-colors"
              aria-label="GitHub"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://github.com/Intin1217/ai-media-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 active:scale-[0.98]"
              style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              설치하기
            </a>
          </div>

          {/* 모바일 햄버거 */}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground rounded-full p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 lg:hidden"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <svg
                width="20"
                height="20"
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
                width="20"
                height="20"
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
        </nav>
      </header>

      {/* 모바일 풀스크린 오버레이 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-background/95 fixed inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-xl lg:hidden"
          >
            <nav
              aria-label="모바일 탐색"
              className="flex flex-col items-center gap-6"
            >
              {NAV_LINKS.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                    delay: index * 0.07,
                  }}
                  className="text-foreground rounded-md px-4 py-2 text-2xl font-semibold transition-colors hover:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  style={{
                    transition: 'color 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onClick={handleNavClick}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="https://github.com/Intin1217/ai-media-studio"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                  delay: NAV_LINKS.length * 0.07,
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-500 px-8 py-3 text-base font-semibold text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                onClick={handleNavClick}
              >
                설치하기
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
