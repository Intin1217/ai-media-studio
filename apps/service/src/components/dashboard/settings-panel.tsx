'use client';

import { useState } from 'react';
import { useDetectionStore } from '@/stores/detection-store';
import { SidebarBrowserAiTab } from './sidebar-browser-ai-tab';
import { SidebarLocalAiTab } from './sidebar-local-ai-tab';

type SettingsTab = 'general' | 'browser-ai' | 'local-ai';

const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: 'general', label: '일반' },
  { key: 'browser-ai', label: '브라우저 AI' },
  { key: 'local-ai', label: '로컬 AI' },
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const modelStatus = useDetectionStore((s) => s.modelStatus);

  return (
    <>
      {/* 모바일 오버레이 배경 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* 패널 본체 */}
      <aside
        aria-label="설정 패널"
        className={`border-border bg-card fixed right-0 top-0 z-30 hidden h-full w-[280px] flex-col overflow-y-auto border-l transition-transform lg:flex ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDuration: '300ms',
        }}
      >
        {/* 헤더 */}
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-foreground text-sm font-semibold">설정</h2>
          <button
            type="button"
            aria-label="설정 패널 닫기"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 탭 선택 */}
        <div className="border-border flex gap-1 border-b px-3 pt-3">
          {SETTINGS_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                activeTab === key
                  ? 'bg-sky-500/15 text-sky-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'general' && (
            <div className="flex flex-col gap-3">
              <div>
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
            </div>
          )}

          {activeTab === 'browser-ai' && <SidebarBrowserAiTab />}

          {activeTab === 'local-ai' && <SidebarLocalAiTab />}
        </div>
      </aside>
    </>
  );
}
