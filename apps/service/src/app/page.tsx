'use client';

import dynamic from 'next/dynamic';

const DashboardLayout = dynamic(
  () => import('@/components/dashboard/dashboard-layout').then((mod) => ({ default: mod.DashboardLayout })),
  { ssr: false },
);

export default function HomePage() {
  return <DashboardLayout />;
}
