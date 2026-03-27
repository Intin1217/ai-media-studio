import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Media Studio Admin',
  description: 'Admin panel for AI Media Studio',
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
