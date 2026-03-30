'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@ai-media-studio/ui';
import { useSettingsStore } from '@/stores/settings-store';
import { checkOllamaConnection, getOllamaModels } from '@/lib/ollama-client';

type OllamaConnectionStatus = 'idle' | 'checking' | 'connected' | 'failed';

export function OllamaSettings() {
  const ollamaEnabled = useSettingsStore((s) => s.ollamaEnabled);
  const setOllamaEnabled = useSettingsStore((s) => s.setOllamaEnabled);
  const ollamaEndpoint = useSettingsStore((s) => s.ollamaEndpoint);
  const setOllamaEndpoint = useSettingsStore((s) => s.setOllamaEndpoint);
  const ollamaModel = useSettingsStore((s) => s.ollamaModel);
  const setOllamaModel = useSettingsStore((s) => s.setOllamaModel);

  const [ollamaStatus, setOllamaStatus] =
    useState<OllamaConnectionStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  async function handleCheckConnection() {
    setOllamaStatus('checking');
    const connected = await checkOllamaConnection(ollamaEndpoint);
    if (connected) {
      setOllamaStatus('connected');
      toast.success('Ollama 연결 성공');
      const models = await getOllamaModels(ollamaEndpoint);
      setAvailableModels(models);
      if (models.length > 0 && !models.includes(ollamaModel)) {
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            로컬 AI 상세 분석 (Ollama)
          </CardTitle>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={ollamaEnabled}
              onChange={(e) => setOllamaEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="bg-muted peer h-4 w-8 rounded-full transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-violet-500 peer-checked:after:translate-x-4" />
          </label>
        </div>
      </CardHeader>

      {ollamaEnabled && (
        <CardContent className="flex flex-col gap-3 pt-0">
          <p className="text-muted-foreground text-xs">
            로컬에서 실행 중인 Ollama Vision 모델로 이미지를 상세 분석합니다.
            브라우저 모델(실시간 감지)과 별개로 동작합니다.
          </p>

          {/* 서버 주소 */}
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs">
              Ollama 서버 주소
            </label>
            <div className="flex gap-1.5">
              <input
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
                className="rounded-md bg-violet-500/10 px-2 py-1 text-xs text-violet-400 transition-colors hover:bg-violet-500/20 disabled:opacity-50"
              >
                연결 확인
              </button>
            </div>
          </div>

          {statusBadge && (
            <div className="flex items-center gap-1.5">{statusBadge}</div>
          )}

          {/* Vision 모델 */}
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs">
              Vision 모델명 (예: qwen3-vl:8b, llava)
            </label>
            {ollamaStatus === 'connected' && availableModels.length > 0 ? (
              <select
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
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                placeholder="qwen3-vl:8b"
                className="bg-background border-border text-foreground focus:ring-ring w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
              />
            )}
          </div>

          <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
            <p>
              활성화하면 각 이미지 결과에 &quot;AI 상세 분석&quot; 버튼이
              표시됩니다.
            </p>
            <p>
              설치:{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-[10px]">
                ollama pull qwen3-vl:8b
              </code>
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
