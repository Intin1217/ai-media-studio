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
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.99-1.315-2.153-2.939l-2.117-2.917-2.651-3.92a338.19 338.19 0 0 0-2.666-3.92c-.009-.002-.018 1.741-.023 3.87-.007 3.724-.007 3.875-.054 3.958a.464.464 0 0 1-.204.201c-.083.042-.156.05-.55.05h-.52l-.11-.068a.442.442 0 0 1-.157-.171l-.05-.106.006-5.184.007-5.186.075-.094a.55.55 0 0 1 .174-.15c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.478 2.212 3.196 4.83l6.378 9.68 2.559 3.88.196-.128c1.743-1.12 3.576-2.718 4.974-4.438a11.88 11.88 0 0 0 2.501-5.699c.096-.659.108-.854.108-1.747s-.012-1.089-.108-1.748c-.652-4.506-3.86-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0z" />
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
        viewBox="0 0 400 400"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect
          width="400"
          height="400"
          rx="50"
          fill="currentColor"
          opacity="0.15"
        />
        <path d="M87.7 242.3v-17.2h101.5V400H170V242.3H87.7zM296.7 400c-11.6 0-22-1.5-31.3-4.4-9.2-2.9-17.1-7.3-23.5-13-6.5-5.7-11.4-12.9-14.9-21.5-3.5-8.6-5.2-18.6-5.2-30h18.3c0 8.2 1.2 15.3 3.6 21.3 2.4 6 5.8 11 10.1 15 4.3 4 9.5 7 15.6 8.9 6.1 2 12.8 3 20.1 3 6.4 0 12.2-.8 17.5-2.3 5.3-1.5 9.8-3.7 13.5-6.5 3.7-2.8 6.6-6.3 8.6-10.4 2-4.1 3.1-8.8 3.1-14 0-5.4-1-10-3-13.8-2-3.8-4.9-7.1-8.7-9.8-3.8-2.7-8.5-5.1-13.9-7.1-5.5-2-11.7-3.9-18.6-5.8-7.4-2-14.4-4.3-20.8-6.8-6.4-2.5-12-5.6-16.8-9.3-4.7-3.7-8.4-8.3-11.1-13.7-2.7-5.4-4-12-4-19.8 0-8 1.6-15 4.8-21 3.2-6 7.6-11 13.1-15.1 5.5-4.1 11.9-7.1 19.2-9.2 7.2-2 14.9-3.1 22.9-3.1 9.2 0 17.5 1.3 24.9 3.8 7.4 2.5 13.7 6.2 19 11 5.3 4.8 9.3 10.7 12.1 17.6 2.8 6.9 4.3 14.7 4.4 23.3h-18.3c-.3-12.5-3.9-22.1-10.6-28.8-6.8-6.7-16.6-10-29.4-10-5.5 0-10.6.7-15.3 2-4.7 1.3-8.8 3.3-12.2 5.9-3.5 2.6-6.2 5.8-8.2 9.6-2 3.8-3 8.1-3 12.9 0 4.8.9 8.9 2.8 12.2 1.9 3.3 4.6 6.2 8.1 8.7 3.5 2.5 7.8 4.7 12.8 6.6 5 2 10.7 3.9 17.1 5.8 7.8 2.2 15.2 4.6 22.3 7.1 7.1 2.5 13.3 5.7 18.7 9.5 5.4 3.8 9.6 8.6 12.8 14.3 3.2 5.7 4.8 12.8 4.8 21.3 0 9.2-1.7 17.1-5.2 23.8-3.5 6.7-8.2 12.3-14.3 16.7-6 4.4-13.2 7.7-21.4 9.8-8.1 2.1-16.9 3.2-26.2 3.2z" />
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
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M1.292 5.856L11.54 0v24L1.292 18.144V5.856zM22.708 5.856L12.46 0v24l10.248-5.856V5.856z"
          opacity="0.6"
        />
        <path d="M1.292 5.856l10.248 5.856v2.576L1.292 8.432V5.856z" />
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
        fill="currentColor"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="3.5" fill="currentColor" />
        <path
          d="M12 2 L20.5 17.5 L3.5 17.5 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
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
