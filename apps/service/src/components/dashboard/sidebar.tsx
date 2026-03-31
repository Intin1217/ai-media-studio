'use client';

import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { useDetectionStore } from '@/stores/detection-store';
import type { DashboardTab } from '@/stores/detection-store';

import { SidebarBrowserAiTab } from './sidebar-browser-ai-tab';
import { SidebarLocalAiTab } from './sidebar-local-ai-tab';

type SidebarTab = 'general' | 'browser-ai' | 'local-ai';

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
        className="h-4 w-4"
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
        className="h-4 w-4"
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
        className="h-4 w-4"
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
        className="h-4 w-4"
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

const TAB_INDEX = Object.fromEntries(
  NAV_ITEMS.map((item, i) => [item.id, i]),
) as Record<DashboardTab, number>;

const ITEM_HEIGHT = 40;

const SETTINGS_TABS: { key: SidebarTab; label: string }[] = [
  { key: 'general', label: '일반' },
  { key: 'browser-ai', label: '브라우저 AI' },
  { key: 'local-ai', label: '로컬 AI' },
];

export function Sidebar() {
  const dashboardTab = useDetectionStore((s) => s.dashboardTab);
  const setDashboardTab = useDetectionStore((s) => s.setDashboardTab);
  const modelStatus = useDetectionStore((s) => s.modelStatus);

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('general');

  const indicatorRef = useRef<HTMLDivElement>(null);

  // anime.js 슬라이딩 인디케이터
  useEffect(() => {
    if (!indicatorRef.current) return;
    const index = TAB_INDEX[dashboardTab];
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      indicatorRef.current.style.transform = `translateY(${index * ITEM_HEIGHT}px)`;
    } else {
      animate(indicatorRef.current, {
        translateY: index * ITEM_HEIGHT,
        duration: 250,
        easing: 'easeOutQuart',
      });
    }
  }, [dashboardTab]);

  return (
    <aside className="border-border bg-card hidden w-64 flex-col overflow-y-auto border-r lg:flex">
      <div className="flex flex-col gap-1 px-3 py-4">
        {/* 네비게이션 섹션 */}
        <div className="relative">
          {/* 슬라이딩 활성 인디케이터 */}
          <div
            ref={indicatorRef}
            className="bg-accent pointer-events-none absolute left-0 top-0 h-10 w-full rounded-md"
            style={{
              transform: `translateY(${TAB_INDEX[dashboardTab] * ITEM_HEIGHT}px)`,
            }}
          />
          {NAV_ITEMS.map((item) => {
            const isActive = dashboardTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDashboardTab(item.id)}
                className={`relative z-10 flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {/* 왼쪽 2px 인디고 바 */}
                {isActive && (
                  <span className="absolute bottom-1 left-0 top-1 w-0.5 rounded-full bg-indigo-500" />
                )}
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>

        <hr className="border-border my-2" />

        {/* 설정 3탭 구조 */}
        <div className="border-border border-t pt-3">
          {/* 탭 선택 버튼 */}
          <div className="mb-3 flex gap-1">
            {SETTINGS_TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSidebarTab(key)}
                className={`flex-1 rounded-md px-1.5 py-1 text-xs font-medium transition-colors ${
                  sidebarTab === key
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          {sidebarTab === 'general' && (
            <div className="px-1 py-2">
              <p className="text-muted-foreground mb-1 text-xs">
                감지 모델 상태
              </p>
              <span
                className={`text-xs font-medium ${
                  modelStatus === 'ready'
                    ? 'text-green-400'
                    : modelStatus === 'error'
                      ? 'text-red-400'
                      : 'text-muted-foreground'
                }`}
              >
                {modelStatus === 'ready'
                  ? '준비됨'
                  : modelStatus === 'loading'
                    ? '로딩 중...'
                    : modelStatus === 'error'
                      ? '오류'
                      : '대기 중'}
              </span>
            </div>
          )}

          {sidebarTab === 'browser-ai' && <SidebarBrowserAiTab />}

          {sidebarTab === 'local-ai' && <SidebarLocalAiTab />}
        </div>
      </div>
    </aside>
  );
}
