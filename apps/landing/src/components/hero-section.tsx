import { buttonVariants, cn } from '@ai-media-studio/ui';
import { SplitText } from '@/components/animations/split-text';
import { GradientBg } from '@/components/animations/gradient-bg';

export function HeroSection() {
  return (
    <section
      id="hero"
      className="bg-background relative overflow-hidden"
      aria-label="히어로 섹션"
    >
      {/* 움직이는 그래디언트 배경 */}
      <GradientBg className="absolute inset-0 -z-10" />

      {/* 도트 그리드 패턴 */}
      <div
        className="absolute inset-0 -z-10 opacity-30 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(185 100% 50% / 0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* 장식 Blob 1 - 좌상단 */}
      <div
        className="from-ai-cyan/20 to-ai-blue/10 animate-blob absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-gradient-to-br blur-3xl md:-left-40 md:-top-40 md:h-96 md:w-96"
        aria-hidden="true"
      />
      {/* 장식 Blob 2 - 우하단 */}
      <div
        className="from-ai-purple/20 to-ai-blue/10 animate-blob animation-delay-2000 absolute -bottom-20 -right-20 -z-10 h-72 w-72 rounded-full bg-gradient-to-tl blur-3xl md:-bottom-40 md:-right-40 md:h-96 md:w-96"
        aria-hidden="true"
      />
      {/* 장식 Blob 3 - 중앙 */}
      <div
        className="from-ai-blue/10 to-ai-purple/10 animate-blob animation-delay-4000 absolute left-1/2 top-1/3 -z-10 h-48 w-48 -translate-x-1/2 rounded-full bg-gradient-to-r blur-3xl md:h-64 md:w-64"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-foreground text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            <SplitText text="내 컴퓨터에서 실행하는" delay={0} />
            <br />
            <SplitText
              text="프라이빗"
              delay={400}
              charClassName="from-ai-cyan to-ai-purple bg-gradient-to-r bg-clip-text text-transparent"
            />
            <SplitText text=" AI 분석" delay={700} />
          </h1>

          <p className="hero-subtitle mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg lg:text-xl dark:text-gray-300">
            외부 서버 없이, 당신의 데이터는 당신의 컴퓨터에.
            <br className="hidden sm:block" />
            웹캠 분석부터 PDF 번역까지 로컬에서.
          </p>

          <div
            className="hero-subtitle mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: '1.3s' }}
          >
            <a
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: 'default', size: 'lg' }),
                'w-full px-8 shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(0,245,255,0.5)] sm:w-auto',
              )}
            >
              설치 가이드
            </a>
            <a
              href="#features"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full px-8 transition-all duration-200 hover:scale-[1.05] hover:shadow-md sm:w-auto',
              )}
            >
              자세히 보기
            </a>
          </div>
        </div>

        {/* 히어로 데모 프리뷰 프레임 */}
        <div
          className="hero-subtitle mt-16 w-full max-w-3xl"
          style={{ animationDelay: '1.5s' }}
          aria-label="서비스 미리보기"
        >
          <div className="border-ai-cyan/20 bg-card/50 relative overflow-hidden rounded-2xl border backdrop-blur-sm">
            {/* 프레임 상단 바 */}
            <div className="border-ai-cyan/10 flex items-center gap-2 border-b px-4 py-3">
              <div
                className="h-3 w-3 rounded-full bg-red-500/70"
                aria-hidden="true"
              />
              <div
                className="h-3 w-3 rounded-full bg-yellow-500/70"
                aria-hidden="true"
              />
              <div
                className="h-3 w-3 rounded-full bg-green-500/70"
                aria-hidden="true"
              />
              <span className="text-muted-foreground ml-3 text-xs">
                AI Media Studio — 로컬 AI 분석
              </span>
            </div>
            {/* 프레임 내용 */}
            <div
              className="relative flex aspect-video items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, hsl(240 33% 9%), hsl(240 40% 13%), hsl(258 30% 12%))',
              }}
            >
              {/* 감지 박스 모형 */}
              <div
                className="relative h-48 w-48 md:h-64 md:w-64"
                aria-hidden="true"
              >
                <div className="border-ai-cyan absolute inset-0 animate-pulse rounded-lg border-2 opacity-60" />
                <div className="border-ai-purple absolute inset-4 animate-pulse rounded-lg border opacity-40 [animation-delay:0.5s]" />
                <div className="flex h-full items-center justify-center">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-ai-cyan/40"
                    aria-hidden="true"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
              {/* 우측 감지 레이블 패널 */}
              <div
                className="absolute right-4 top-4 hidden flex-col gap-2 md:flex"
                aria-hidden="true"
              >
                {['person 98%', 'car 87%', 'dog 72%'].map((label) => (
                  <div
                    key={label}
                    className="border-ai-cyan/20 bg-card/80 rounded-md border px-3 py-1 text-xs text-gray-300"
                  >
                    {label}
                  </div>
                ))}
              </div>
              {/* 좌측 하단 FPS 배지 */}
              <div
                className="border-ai-cyan/30 bg-card/80 absolute bottom-4 left-4 rounded-full border px-3 py-1 text-xs font-medium"
                aria-hidden="true"
              >
                <span className="text-ai-cyan">60fps</span>
                <span className="text-muted-foreground ml-1">실시간</span>
              </div>
            </div>
          </div>
        </div>

        {/* 스크롤 다운 인디케이터 */}
        <a
          href="#features"
          className="text-muted-foreground hover:text-ai-cyan absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce transition-colors duration-200"
          aria-label="아래로 스크롤"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
