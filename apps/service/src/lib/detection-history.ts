import {
  db,
  type DetectionLog,
  type FaceAnalysisLog,
  type SessionInfo,
} from './db';

export async function saveDetectionLog(
  log: Omit<DetectionLog, 'id'>,
): Promise<void> {
  await db.detectionLogs.add(log as DetectionLog);
}

export async function startSession(): Promise<string> {
  const id = crypto.randomUUID();
  await db.sessions.add({
    id,
    startedAt: Date.now(),
    totalFrames: 0,
  });
  return id;
}

export async function endSession(sessionId: string): Promise<void> {
  const count = await db.detectionLogs
    .where('sessionId')
    .equals(sessionId)
    .count();
  await db.sessions.update(sessionId, {
    endedAt: Date.now(),
    totalFrames: count,
  });
}

export async function getDetectionLogs(
  options: {
    sessionId?: string;
    since?: number;
    limit?: number;
  } = {},
): Promise<DetectionLog[]> {
  let collection = db.detectionLogs.orderBy('timestamp');

  if (options.since) {
    collection = db.detectionLogs
      .where('timestamp')
      .aboveOrEqual(options.since)
      .reverse();
  }

  if (options.sessionId) {
    const logs = await db.detectionLogs
      .where('sessionId')
      .equals(options.sessionId)
      .sortBy('timestamp');
    return options.limit ? logs.slice(-options.limit) : logs;
  }

  const logs = await collection.reverse().toArray();
  return options.limit ? logs.slice(0, options.limit) : logs;
}

export async function getSessions(limit = 10): Promise<SessionInfo[]> {
  return db.sessions.orderBy('startedAt').reverse().limit(limit).toArray();
}

export async function clearAllHistory(): Promise<void> {
  await db.detectionLogs.clear();
  await db.sessions.clear();
  await db.faceAnalysisLogs.clear();
}

export async function saveFaceAnalysisLog(log: FaceAnalysisLog): Promise<void> {
  await db.faceAnalysisLogs.add(log);
}

export async function getFaceAnalysisLogs(
  sessionId: string,
): Promise<FaceAnalysisLog[]> {
  return db.faceAnalysisLogs
    .where('sessionId')
    .equals(sessionId)
    .sortBy('timestamp');
}
