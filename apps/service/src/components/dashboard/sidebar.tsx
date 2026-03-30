'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { animate } from 'animejs';
import { useDetectionStore } from '@/stores/detection-store';
import type { DashboardTab } from '@/stores/detection-store';
import { useSettingsStore } from '@/stores/settings-store';
import { checkOllamaConnection, getOllamaModels } from '@/lib/ollama-client';

type OllamaConnectionStatus = 'idle' | 'checking' | 'connected' | 'failed';

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

export function Sidebar() {
  const dashboardTab = useDetectionStore((s) => s.dashboardTab);
  const setDashboardTab = useDetectionStore((s) => s.setDashboardTab);
  const modelStatus = useDetectionStore((s) => s.modelStatus);

  const ollamaEnabled = useSettingsStore((s) => s.ollamaEnabled);
  const setOllamaEnabled = useSettingsStore((s) => s.setOllamaEnabled);
  const ollamaEndpoint = useSettingsStore((s) => s.ollamaEndpoint);
  const setOllamaEndpoint = useSettingsStore((s) => s.setOllamaEndpoint);
  const ollamaModel = useSettingsStore((s) => s.ollamaModel);
  const setOllamaModel = useSettingsStore((s) => s.setOllamaModel);
  const ollamaCustomPrompt = useSettingsStore((s) => s.ollamaCustomPrompt);
  const setOllamaCustomPrompt = useSettingsStore(
    (s) => s.setOllamaCustomPrompt,
  );
  const ollamaPromptMode = useSettingsStore((s) => s.ollamaPromptMode);
  const setOllamaPromptMode = useSettingsStore((s) => s.setOllamaPromptMode);

  const [ollamaStatus, setOllamaStatus] =
    useState<OllamaConnectionStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [ollamaOpen, setOllamaOpen] = useState(true);

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

  async function handleCheckConnection() {
    setOllamaStatus('checking');
    const connected = await checkOllamaConnection(ollamaEndpoint);
    if (connected) {
      setOllamaStatus('connected');
      toast.success('Ollama 연결 성공');
      const models = await getOllamaModels(ollamaEndpoint);
      setAvailableModels(models);
      if (models.length === 0) {
        toast.warning('설치된 모델이 없습니다', {
          description: 'ollama pull qwen3-vl:8b 명령으로 모델을 설치해주세요.',
        });
      } else if (!models.includes(ollamaModel)) {
        setOllamaModel(models[0]!);
      }
    } else {
      setOllamaStatus('failed');
      setAvailableModels([]);
      toast.error('Ollama에 연결할 수 없습니다', {
        description: 'Ollama가 실행 중인지 확인해주세요.',
      });
    }
  }

  const statusBadge = {
    idle: null,
    checking: (
      <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
        확인 중...
      </span>
    ),
    connected: (
      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
        연결됨
      </span>
    ),
    failed: (
      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
        연결 안 됨
      </span>
    ),
  }[ollamaStatus];

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

        {/* Ollama 설정 섹션 */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            aria-expanded={ollamaOpen}
            aria-controls="sidebar-ollama-section"
            onClick={() => setOllamaOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground flex items-center justify-between px-1 py-1 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Ollama 설정
            <svg
              className={`h-3 w-3 transition-transform ${ollamaOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {ollamaOpen && (
            <div
              id="sidebar-ollama-section"
              className="flex flex-col gap-3 px-1"
            >
              {/* 토글 스위치 */}
              <div className="flex items-center justify-between">
                <span className="text-foreground text-xs">활성화</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={ollamaEnabled}
                    onChange={(e) => setOllamaEnabled(e.target.checked)}
                    className="peer sr-only"
                    aria-label="Ollama 활성화"
                  />
                  <div className="bg-muted peer h-4 w-8 rounded-full transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-violet-500 peer-checked:after:translate-x-4" />
                </label>
              </div>

              {/* 엔드포인트 */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="sidebar-ollama-endpoint"
                  className="text-muted-foreground text-xs"
                >
                  서버 주소
                </label>
                <div className="flex gap-1.5">
                  <input
                    id="sidebar-ollama-endpoint"
                    type="text"
                    value={ollamaEndpoint}
                    onChange={(e) => {
                      setOllamaEndpoint(e.target.value);
                      setOllamaStatus('idle');
                      setAvailableModels([]);
                    }}
                    placeholder="http://localhost:11434"
                    className="bg-background border-border text-foreground focus:ring-ring min-w-0 flex-1 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
                  />
                  <button
                    type="button"
                    onClick={handleCheckConnection}
                    disabled={ollamaStatus === 'checking'}
                    className="whitespace-nowrap rounded-md bg-violet-500/10 px-2 py-1 text-xs text-violet-400 transition-colors hover:bg-violet-500/20 disabled:opacity-50"
                  >
                    확인
                  </button>
                </div>
              </div>

              {/* 연결 상태 */}
              {statusBadge && (
                <div className="flex items-center gap-1.5">{statusBadge}</div>
              )}

              {/* 모델 선택 */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="sidebar-ollama-model"
                  className="text-muted-foreground text-xs"
                >
                  Vision 모델
                </label>
                {ollamaStatus === 'connected' && availableModels.length > 0 ? (
                  <select
                    id="sidebar-ollama-model"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="bg-background border-border text-foreground focus:ring-ring w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
                  >
                    {availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="sidebar-ollama-model"
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="qwen3-vl:8b"
                    className="bg-background border-border text-foreground focus:ring-ring w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
                  />
                )}
              </div>

              {/* 커스텀 프롬프트 */}
              {ollamaEnabled && (
                <>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="sidebar-ollama-prompt"
                      className="text-muted-foreground text-xs"
                    >
                      분석 프롬프트
                    </label>
                    <textarea
                      id="sidebar-ollama-prompt"
                      value={ollamaCustomPrompt}
                      onChange={(e) => setOllamaCustomPrompt(e.target.value)}
                      rows={3}
                      className="bg-background border-border text-foreground focus:ring-ring w-full resize-none rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
                    />
                  </div>

                  {/* 적용 모드 라디오 */}
                  <div className="flex flex-col gap-1">
                    <p className="text-muted-foreground text-xs">적용 방식</p>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="sidebar-promptMode"
                        value="all"
                        checked={ollamaPromptMode === 'all'}
                        onChange={() => setOllamaPromptMode('all')}
                      />
                      전체 이미지에 동일 프롬프트
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="sidebar-promptMode"
                        value="per-image"
                        checked={ollamaPromptMode === 'per-image'}
                        onChange={() => setOllamaPromptMode('per-image')}
                      />
                      이미지별 개별 프롬프트
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <hr className="border-border my-2" />

        {/* 모델 상태 */}
        <div className="px-1 py-2">
          <p className="text-muted-foreground mb-1 text-xs">감지 모델</p>
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
    </aside>
  );
}
