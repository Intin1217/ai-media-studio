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
          <h1 className="text-foreground text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            <SplitText text="AI로 영상을 분석하는" delay={0} />
            <br />
            <SplitText text="가장 " delay={400} />
            <SplitText
              text="스마트한"
              delay={600}
              charClassName="from-ai-cyan to-ai-purple bg-gradient-to-r bg-clip-text text-transparent"
            />
            <SplitText text=" 방법" delay={900} />
          </h1>

          <p className="hero-subtitle text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg lg:text-xl">
            웹캠 하나로 실시간 객체 감지부터 통계 시각화까지,
            <br className="hidden sm:block" />
            브라우저에서 모두 해결하세요.
          </p>

          <div
            className="hero-subtitle mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: '1.3s' }}
          >
            <a
              href="/service"
              className={cn(
                buttonVariants({ variant: 'default', size: 'lg' }),
                'shadow-primary/25 w-full px-8 shadow-lg transition-all duration-200 hover:scale-[1.05] hover:shadow-xl sm:w-auto',
              )}
            >
              지금 시작하기
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
