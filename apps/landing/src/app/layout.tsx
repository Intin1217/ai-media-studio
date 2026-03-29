import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Media Studio - AI 기반 실시간 미디어 분석',
  description:
    '웹캠으로 실시간 영상을 캡처하고, TensorFlow.js로 객체를 감지하여 분석 결과를 시각화하는 서비스입니다. 설치 없이 브라우저에서 바로 시작하세요.',
  keywords: [
    'AI 영상 분석',
    '실시간 객체 감지',
    'TensorFlow.js',
    '웹캠 AI',
    'Next.js',
    'WebRTC',
    '브라우저 AI',
    '실시간 통계',
  ],
  authors: [{ name: 'AI Media Studio' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'AI Media Studio - AI 기반 실시간 미디어 분석',
    description:
      '웹캠 하나로 실시간 객체 감지부터 통계 시각화까지, 브라우저에서 모두 해결하세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'AI Media Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Media Studio',
    description:
      '웹캠 하나로 실시간 객체 감지부터 통계 시각화까지, 브라우저에서 모두 해결하세요.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'AI Media Studio',
      description: 'AI 기반 실시간 미디어 분석 서비스',
      url: 'https://ai-media-studio.vercel.app',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'AI Media Studio',
      applicationCategory: 'MultimediaApplication',
      description:
        '웹캠으로 실시간 영상을 캡처하고, TensorFlow.js로 객체를 감지하여 분석 결과를 시각화하는 서비스',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW',
      },
      operatingSystem: 'Any (Web Browser)',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <style>{`
          :root { --font-pretendard: 'Pretendard Variable', Pretendard; }
        `}</style>
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="focus:bg-background focus:ring-ring focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:ring-2"
        >
          본문으로 바로가기
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
