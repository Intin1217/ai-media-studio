'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DetectionLog, FaceAnalysisLog, SessionInfo } from '@/lib/db';
import {
  getDetectionLogs,
  getSessions,
  clearAllHistory,
  getAllFaceAnalysisLogs,
} from '@/lib/detection-history';

type TimeRange = 'today' | '7days' | 'all';

function getTimestamp(range: TimeRange): number | undefined {
  const now = Date.now();
  switch (range) {
    case 'today':
      return now - 24 * 60 * 60 * 1000;
    case '7days':
      return now - 7 * 24 * 60 * 60 * 1000;
    case 'all':
      return undefined;
  }
}

export function useDetectionHistory(timeRange: TimeRange = 'today') {
  const [logs, setLogs] = useState<DetectionLog[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [faceAnalysisLogs, setFaceAnalysisLogs] = useState<FaceAnalysisLog[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const since = getTimestamp(timeRange);
    const [logData, sessionData, faceLogData] = await Promise.all([
      getDetectionLogs({ since, limit: 1000 }),
      getSessions(20),
      getAllFaceAnalysisLogs({ since, limit: 1000 }),
    ]);
    setLogs(logData);
    setSessions(sessionData);
    setFaceAnalysisLogs(faceLogData);
    setIsLoading(false);
  }, [timeRange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clearHistory = useCallback(async () => {
    await clearAllHistory();
    await refresh();
  }, [refresh]);

  return { logs, sessions, faceAnalysisLogs, isLoading, refresh, clearHistory };
}

export type { TimeRange };
