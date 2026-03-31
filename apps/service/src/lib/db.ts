import Dexie, { type Table } from 'dexie';

export interface DetectionLog {
  id?: number;
  sessionId: string;
  timestamp: number;
  detections: Array<{ class: string; score: number }>;
  fps: number;
  inferenceTime: number;
}

export interface FaceAnalysisLog {
  id?: number;
  sessionId: string;
  timestamp: number;
  trackingId: string;
  gender: 'male' | 'female';
  age: number;
  presenceTime: number;
  gazeTime: number;
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
  faceAnalysisLogs!: Table<FaceAnalysisLog>;

  constructor() {
    super('ai-media-studio');
    this.version(1).stores({
      detectionLogs: '++id, sessionId, timestamp',
      sessions: 'id, startedAt',
    });
    this.version(2).stores({
      detectionLogs: '++id, sessionId, timestamp',
      sessions: 'id, startedAt',
      faceAnalysisLogs: '++id, sessionId, timestamp, trackingId',
    });
  }
}

export const db = new DetectionDB();
