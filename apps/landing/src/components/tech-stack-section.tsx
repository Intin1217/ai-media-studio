import { ScrollReveal } from './scroll-reveal';

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
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect
          width="24"
          height="24"
          rx="3"
          fill="currentColor"
          opacity="0.15"
        />
        <text x="3" y="17" fontSize="11" fontWeight="bold" fill="currentColor">
          TS
        </text>
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
    name: 'Tailwind CSS',
    label: 'Styling',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 6C9.33 6 7.67 7.33 7 10c1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.09 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.61 7.15 14.51 6 12 6zM7 14c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C8.39 18.85 9.49 20 12 20c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C10.61 15.15 9.51 14 7 14z" />
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
    name: 'Canvas API',
    label: 'Rendering',
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
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.5" />
        <path d="M2 15l5-5 4 4 3-3 8 8" />
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
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    ),
  },
] as const;

export function TechStackSection() {
  return (
    <section
      id="tech-stack"
      aria-labelledby="tech-heading"
      className="bg-muted/50 py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <ScrollReveal className="mb-12 text-center md:mb-16">
          <p className="text-ai-cyan mb-3 text-sm font-medium uppercase tracking-widest">
            기술 스택
          </p>
          <h2
            id="tech-heading"
            className="text-foreground text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl"
          >
            검증된 최신 기술로 구축
          </h2>
        </ScrollReveal>

        {/* 기술 뱃지 */}
        <ScrollReveal>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="border-border bg-card text-foreground hover:border-ai-cyan/40 hover:bg-ai-cyan/5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm md:px-5 md:py-2.5"
              >
                <span className="text-ai-cyan flex-shrink-0">{tech.icon}</span>
                <span>{tech.name}</span>
                <span className="text-muted-foreground hidden text-xs sm:inline">
                  {tech.label}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
