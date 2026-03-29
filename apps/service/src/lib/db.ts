import Dexie, { type Table } from 'dexie';

export interface DetectionLog {
  id?: number;
  sessionId: string;
  timestamp: number;
  detections: Array<{ class: string; score: number }>;
  fps: number;
  inferenceTime: number;
}

export interface SessionInfo {
  id: string;
  startedAt: number;
  endedAt?: number;
  totalFrames: number;
}

class DetectionDB extends Dexie {
  detectionLogs!: Table<DetectionLog>;
  sessions!: Table<SessionInfo>;

  constructor() {
    super('ai-media-studio');
    this.version(1).stores({
      detectionLogs: '++id, sessionId, timestamp',
      sessions: 'id, startedAt',
    });
  }
}

export const db = new DetectionDB();
