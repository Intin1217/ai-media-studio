import { ScrollAnimation } from './scroll-animation';

const TECH_STACK = [
  {
    name: 'Next.js 15',
    label: 'Framework',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9 8l6 8" strokeWidth="2.5" />
        <path d="M9 16V8" />
        <path d="M15 12v4" />
      </svg>
    ),
  },
  {
    name: 'React 19',
    label: 'UI Library',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'TypeScript 5',
    label: 'Language',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line
          x1="12"
          y1="3"
          x2="12"
          y2="21"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />
      </svg>
    ),
  },
  {
    name: 'TensorFlow.js',
    label: 'AI/ML',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {/* 뉴런 노드 — 중심 + 연결선 */}
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="7" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="20" cy="7" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="17" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="20" cy="17" r="1.5" fill="currentColor" stroke="none" />
        <line x1="5.5" y1="7.5" x2="9.8" y2="10.8" />
        <line x1="18.5" y1="7.5" x2="14.2" y2="10.8" />
        <line x1="5.5" y1="16.5" x2="9.8" y2="13.2" />
        <line x1="18.5" y1="16.5" x2="14.2" y2="13.2" />
      </svg>
    ),
  },
  {
    name: 'WebRTC',
    label: 'Media',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.899L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
      </svg>
    ),
  },
  {
    name: 'Turborepo',
    label: 'Build',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* 번개 (빌드 속도 상징) */}
        <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    name: 'Ollama',
    label: 'Local AI',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        {/* 대화 버블 (LLM/채팅 연상) */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        />
        {/* 내부 점 3개 — 생각 중 표현 */}
        <circle cx="9" cy="11" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="12" cy="11" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="15" cy="11" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function TechStackSection() {
  return (
    <section
      id="tech-stack"
      aria-labelledby="tech-heading"
      className="bg-muted/30 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <ScrollAnimation className="mb-12 text-center md:mb-16">
          <span className="mb-6 inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-500">
            기술 스택
          </span>
          <h2
            id="tech-heading"
            className="text-foreground text-2xl font-bold leading-snug tracking-tight md:text-3xl lg:text-4xl"
          >
            검증된 최신 기술로 구축
          </h2>
        </ScrollAnimation>

        {/* 기술 뱃지 */}
        <ScrollAnimation>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="border-border bg-card text-foreground hover:border-ai-cyan/40 hover:bg-ai-cyan/5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:scale-105 hover:shadow-sm md:px-5 md:py-2.5"
                style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <span className="text-ai-cyan flex-shrink-0">{tech.icon}</span>
                <span>{tech.name}</span>
                <span className="text-muted-foreground hidden text-xs sm:inline">
                  {tech.label}
                </span>
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
