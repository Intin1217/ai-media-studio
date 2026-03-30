import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Media Studio - 실시간 객체 감지',
  description: '웹캠과 TensorFlow.js를 활용한 실시간 객체 감지 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="ams-theme"
        >
          {children}
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          toastOptions={{
            className: 'text-sm',
          }}
        />
      </body>
    </html>
  );
}
