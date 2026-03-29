const SERVICE_LINKS = [
  { label: '기능', href: '#features' },
  { label: '사용법', href: '#how-it-works' },
  { label: '기술 스택', href: '#tech-stack' },
] as const;

const DEV_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/Intin1217/ai-media-studio',
    external: true,
  },
  { label: '포트폴리오', href: '#', external: false },
] as const;

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="bg-primary text-primary-foreground py-12 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 메인 푸터 콘텐츠 */}
        <div className="flex flex-col gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          {/* 로고 영역 */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="opacity-90"
              >
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <circle cx="4" cy="8" r="2" fill="currentColor" opacity="0.7" />
                <circle
                  cx="20"
                  cy="8"
                  r="2"
                  fill="currentColor"
                  opacity="0.7"
                />
                <circle
                  cx="4"
                  cy="16"
                  r="2"
                  fill="currentColor"
                  opacity="0.7"
                />
                <circle
                  cx="20"
                  cy="16"
                  r="2"
                  fill="currentColor"
                  opacity="0.7"
                />
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
              <span className="text-lg font-bold">AI Media Studio</span>
            </div>
            <p className="mt-2 max-w-xs text-sm opacity-70">
              웹캠으로 실시간 AI 분석을 경험하세요.
              <br />
              브라우저에서 바로 시작할 수 있습니다.
            </p>
          </div>

          {/* 링크 그룹 - 서비스 */}
          <div>
            <nav aria-label="서비스 탐색">
              <h3 className="mb-3 text-sm font-semibold opacity-90">서비스</h3>
              <ul className="flex flex-col gap-2">
                {SERVICE_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-primary-foreground/70 hover:text-primary-foreground focus-visible:ring-primary-foreground/50 rounded-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* 링크 그룹 - 개발 */}
          <div>
            <nav aria-label="개발자 링크">
              <h3 className="mb-3 text-sm font-semibold opacity-90">개발</h3>
              <ul className="flex flex-col gap-2">
                {DEV_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="text-primary-foreground/70 hover:text-primary-foreground focus-visible:ring-primary-foreground/50 rounded-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                    >
                      {link.label}
                      {link.external && (
                        <span className="sr-only">(새 탭에서 열림)</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* 구분선 + 저작권 */}
        <div className="border-primary-foreground/20 text-primary-foreground/60 mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm md:flex-row">
          <p>© 2026 Intin1217. All rights reserved.</p>
          <p>Built with Next.js, TensorFlow.js</p>
        </div>
      </div>
    </footer>
  );
}
