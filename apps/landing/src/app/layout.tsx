import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Media Studio - AI 기반 실시간 미디어 분석',
  description:
    '웹캠으로 실시간 영상을 캡처하고, AI로 객체를 감지하여 분석 결과를 시각화하는 서비스입니다.',
  openGraph: {
    title: 'AI Media Studio',
    description: 'AI 기반 실시간 미디어 분석 서비스',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
