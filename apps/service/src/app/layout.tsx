import type { Metadata } from 'next';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Media Studio - 실시간 객체 감지',
  description: '웹캠과 TensorFlow.js를 활용한 실시간 객체 감지 대시보드',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
