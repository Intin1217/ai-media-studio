'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useSettingsStore } from '@/stores/settings-store';
import { checkOllamaConnection, getOllamaModels } from '@/lib/ollama-client';

type OllamaConnectionStatus = 'idle' | 'checking' | 'connected' | 'failed';

const STATUS_INDICATOR: Record<
  OllamaConnectionStatus,
  { color: string; label: string } | null
> = {
  idle: null,
  checking: { color: 'bg-yellow-400', label: '확인 중...' },
  connected: { color: 'bg-green-400', label: '연결됨' },
  failed: { color: 'bg-red-400', label: '연결 실패' },
};

export function SidebarLocalAiTab() {
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

  const [connectionStatus, setConnectionStatus] =
    useState<OllamaConnectionStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  async function handleCheckConnection() {
    setConnectionStatus('checking');
    const connected = await checkOllamaConnection(ollamaEndpoint);
    if (connected) {
      setConnectionStatus('connected');
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
      setConnectionStatus('failed');
      setAvailableModels([]);
      toast.error('Ollama에 연결할 수 없습니다', {
        description: 'Ollama가 실행 중인지 확인해주세요.',
      });
    }
  }

  const statusIndicator = STATUS_INDICATOR[connectionStatus];

  return (
    <div className="flex flex-col gap-3 px-1">
      {/* Step 1: 활성화 토글 */}
      <div className="flex items-center justify-between">
        <span className="text-foreground text-xs font-medium">
          Ollama 활성화
        </span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={ollamaEnabled}
            onChange={(e) => setOllamaEnabled(e.target.checked)}
            className="peer sr-only"
            aria-label="Ollama 활성화"
          />
          <div className="bg-secondary peer h-4 w-8 rounded-full transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-sky-500 peer-checked:after:translate-x-4" />
        </label>
      </div>

      {/* Step 2: 서버 주소 입력 + 연결 확인 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="local-ai-endpoint"
          className="text-muted-foreground text-xs"
        >
          서버 주소
        </label>
        <div className="flex gap-1.5">
          <input
            id="local-ai-endpoint"
            type="text"
            value={ollamaEndpoint}
            onChange={(e) => {
              setOllamaEndpoint(e.target.value);
              setConnectionStatus('idle');
              setAvailableModels([]);
            }}
            placeholder="http://localhost:11434"
            className="bg-background border-border text-foreground focus:ring-ring min-w-0 flex-1 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
          />
          <button
            type="button"
            onClick={handleCheckConnection}
            disabled={connectionStatus === 'checking'}
            className="whitespace-nowrap rounded-md bg-sky-500/10 px-2 py-1 text-xs text-sky-400 transition-colors hover:bg-sky-500/20 disabled:opacity-50"
          >
            연결 확인
          </button>
        </div>
      </div>

      {/* 연결 상태 인디케이터 */}
      {statusIndicator && (
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${statusIndicator.color}`} />
          <span className="text-muted-foreground text-xs">
            {statusIndicator.label}
          </span>
        </div>
      )}

      {/* Step 3: 모델 선택 (연결 성공 후 활성화) */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="local-ai-model"
          className="text-muted-foreground text-xs"
        >
          Vision 모델
        </label>
        {connectionStatus === 'connected' && availableModels.length > 0 ? (
          <select
            id="local-ai-model"
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
          <select
            id="local-ai-model"
            disabled
            className="bg-background border-border text-muted-foreground focus:ring-ring w-full cursor-not-allowed rounded-md border px-2 py-1 text-xs opacity-50 focus:outline-none focus:ring-1"
          >
            <option>먼저 서버 연결을 확인하세요</option>
          </select>
        )}
      </div>

      {/* 커스텀 프롬프트 + 적용 방식 (활성화 시만 표시) */}
      {ollamaEnabled && (
        <>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="local-ai-prompt"
              className="text-muted-foreground text-xs"
            >
              분석 프롬프트
            </label>
            <textarea
              id="local-ai-prompt"
              value={ollamaCustomPrompt}
              onChange={(e) => setOllamaCustomPrompt(e.target.value)}
              rows={3}
              className="bg-background border-border text-foreground focus:ring-ring w-full resize-none rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs">적용 방식</p>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs">
              <input
                type="radio"
                name="local-ai-promptMode"
                value="all"
                checked={ollamaPromptMode === 'all'}
                onChange={() => setOllamaPromptMode('all')}
              />
              전체 이미지에 동일 프롬프트
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs">
              <input
                type="radio"
                name="local-ai-promptMode"
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
  );
}
