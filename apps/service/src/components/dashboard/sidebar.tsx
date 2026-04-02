'use client';

import { useDetectionStore } from '@/stores/detection-store';
import type { DashboardTab } from '@/stores/detection-store';
import { ThemeToggle } from '@/components/theme-toggle';

export const NAV_ITEMS: {
  id: DashboardTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'realtime',
    label: '실시간 감지',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'image-analysis',
    label: '이미지 분석',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    id: 'statistics',
    label: '통계',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
        <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'pdf',
    label: 'PDF 번역',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

interface SidebarProps {
  onSettingsToggle: () => void;
  isSettingsPanelOpen: boolean;
}

export function Sidebar({
  onSettingsToggle,
  isSettingsPanelOpen,
}: SidebarProps) {
  const dashboardTab = useDetectionStore((s) => s.dashboardTab);
  const setDashboardTab = useDetectionStore((s) => s.setDashboardTab);

  return (
    <aside className="border-border bg-card hidden w-[52px] flex-col items-center border-r py-3 lg:flex">
      {/* 로고 */}
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15">
        <span className="text-xs font-bold text-sky-400">AI</span>
      </div>

      {/* 네비게이션 아이콘 */}
      <nav
        className="flex flex-1 flex-col items-center gap-1"
        aria-label="메인 네비게이션"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = dashboardTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setDashboardTab(item.id)}
              className={`group relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {item.icon}
              {/* CSS 기반 툴팁 */}
              <span className="bg-popover text-popover-foreground pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md px-2 py-1 text-xs opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 하단 액션 */}
      <div className="flex flex-col items-center gap-1">
        {/* 테마 토글 */}
        <ThemeToggle />

        {/* 설정 아이콘 */}
        <button
          type="button"
          title="설정"
          aria-label="설정 패널 열기"
          aria-expanded={isSettingsPanelOpen}
          aria-controls="settings-panel"
          onClick={onSettingsToggle}
          className="text-muted-foreground hover:bg-accent hover:text-foreground group relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="3" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
            />
          </svg>
          <span className="bg-popover text-popover-foreground pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md px-2 py-1 text-xs opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            설정
          </span>
        </button>
      </div>
    </aside>
  );
}
