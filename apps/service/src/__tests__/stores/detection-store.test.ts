import { describe, it, expect, beforeEach } from 'vitest';
import { useDetectionStore } from '@/stores/detection-store';

const makePerson = () => ({
  class: 'person',
  score: 0.9,
  bbox: { x: 0, y: 0, width: 100, height: 200 },
});

const makeCar = () => ({
  class: 'car',
  score: 0.8,
  bbox: { x: 0, y: 0, width: 1, height: 1 },
});

describe('useDetectionStore', () => {
  beforeEach(() => {
    useDetectionStore.getState().reset();
  });

  it('초기 상태가 올바름', () => {
    const state = useDetectionStore.getState();
    expect(state.modelStatus).toBe('idle');
    expect(state.webcamStatus).toBe('idle');
    expect(state.detections).toEqual([]);
    expect(state.isDetecting).toBe(false);
  });

  it('setModelStatus로 상태 변경', () => {
    useDetectionStore.getState().setModelStatus('loading');
    expect(useDetectionStore.getState().modelStatus).toBe('loading');
  });

  it('incrementDetectionCounts 누적 카운트', () => {
    const { incrementDetectionCounts } = useDetectionStore.getState();
    incrementDetectionCounts([
      {
        class: 'person',
        score: 0.9,
        bbox: { x: 0, y: 0, width: 1, height: 1 },
      },
      {
        class: 'person',
        score: 0.8,
        bbox: { x: 0, y: 0, width: 1, height: 1 },
      },
      { class: 'car', score: 0.7, bbox: { x: 0, y: 0, width: 1, height: 1 } },
    ]);
    expect(useDetectionStore.getState().detectionCounts).toEqual({
      person: 2,
      car: 1,
    });
  });

  it('reset으로 초기 상태 복원', () => {
    useDetectionStore.getState().setModelStatus('ready');
    useDetectionStore.getState().setIsDetecting(true);
    useDetectionStore.getState().reset();
    expect(useDetectionStore.getState().modelStatus).toBe('idle');
    expect(useDetectionStore.getState().isDetecting).toBe(false);
  });

  it('setStatsMode로 통계 모드 변경', () => {
    useDetectionStore.getState().setStatsMode('per-second');
    expect(useDetectionStore.getState().statsMode).toBe('per-second');

    useDetectionStore.getState().setStatsMode('current-frame');
    expect(useDetectionStore.getState().statsMode).toBe('current-frame');

    useDetectionStore.getState().setStatsMode('unique');
    expect(useDetectionStore.getState().statsMode).toBe('unique');
  });

  it('setDashboardTab로 탭 변경', () => {
    useDetectionStore.getState().setDashboardTab('image-analysis');
    expect(useDetectionStore.getState().dashboardTab).toBe('image-analysis');

    useDetectionStore.getState().setDashboardTab('realtime');
    expect(useDetectionStore.getState().dashboardTab).toBe('realtime');
  });

  it('updateUniqueDetections: 이전 프레임에 없던 객체만 카운트', () => {
    const person = makePerson();
    const car = makeCar();

    // 첫 번째 프레임: person 감지 → detections=[person], previousDetections=[]
    useDetectionStore.getState().setDetections([person]);
    // 두 번째 프레임: person+car 감지 → detections=[person,car], previousDetections=[person]
    useDetectionStore.getState().setDetections([person, car]);

    // previousDetections=[person]이므로 car만 신규 → car만 +1
    useDetectionStore.getState().updateUniqueDetections([person, car]);

    const { uniqueDetectionCounts } = useDetectionStore.getState();
    expect(uniqueDetectionCounts['person']).toBeUndefined();
    expect(uniqueDetectionCounts['car']).toBe(1);
  });

  it('updatePerSecondCounts: 현재 감지를 초당 카운트로 설정', () => {
    const person = makePerson();
    const car = makeCar();

    useDetectionStore.getState().updatePerSecondCounts([person, person, car]);

    const { perSecondCounts } = useDetectionStore.getState();
    expect(perSecondCounts['person']).toBe(2);
    expect(perSecondCounts['car']).toBe(1);

    // 호출 시 전체 교체 (이전 값 없어짐)
    useDetectionStore.getState().updatePerSecondCounts([car]);
    const updated = useDetectionStore.getState().perSecondCounts;
    expect(updated['person']).toBeUndefined();
    expect(updated['car']).toBe(1);
  });

  it('addImageAnalysisResult: 이미지 분석 결과 추가', () => {
    const result = {
      id: 'test-id',
      file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      imageUrl: 'blob:http://localhost/test',
      detections: [makePerson()],
      inferenceTime: 42,
      analyzedAt: Date.now(),
    };

    useDetectionStore.getState().addImageAnalysisResult(result);

    const { imageAnalysisResults } = useDetectionStore.getState();
    expect(imageAnalysisResults).toHaveLength(1);
    expect(imageAnalysisResults[0].id).toBe('test-id');
    expect(imageAnalysisResults[0].inferenceTime).toBe(42);
    expect(imageAnalysisResults[0].detections).toHaveLength(1);
  });

  it('removeImageAnalysisResult: 특정 결과 삭제', () => {
    const result1 = {
      id: 'id-1',
      file: new File([''], 'a.jpg', { type: 'image/jpeg' }),
      imageUrl: 'blob:http://localhost/a',
      detections: [],
      inferenceTime: 10,
      analyzedAt: Date.now(),
    };
    const result2 = {
      id: 'id-2',
      file: new File([''], 'b.jpg', { type: 'image/jpeg' }),
      imageUrl: 'blob:http://localhost/b',
      detections: [],
      inferenceTime: 20,
      analyzedAt: Date.now(),
    };

    useDetectionStore.getState().addImageAnalysisResult(result1);
    useDetectionStore.getState().addImageAnalysisResult(result2);
    useDetectionStore.getState().removeImageAnalysisResult('id-1');

    const { imageAnalysisResults } = useDetectionStore.getState();
    expect(imageAnalysisResults).toHaveLength(1);
    expect(imageAnalysisResults[0].id).toBe('id-2');
  });

  it('clearImageAnalysisResults: 전체 삭제', () => {
    useDetectionStore.getState().addImageAnalysisResult({
      id: 'test-id',
      file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      imageUrl: 'blob:http://localhost/test',
      detections: [],
      inferenceTime: 10,
      analyzedAt: Date.now(),
    });

    useDetectionStore.getState().clearImageAnalysisResults();
    expect(useDetectionStore.getState().imageAnalysisResults).toHaveLength(0);
  });

  it('setDetections가 previousDetections도 업데이트', () => {
    const personA = {
      class: 'person',
      score: 0.9,
      bbox: { x: 0, y: 0, width: 1, height: 1 },
    };
    const personB = {
      class: 'dog',
      score: 0.8,
      bbox: { x: 10, y: 10, width: 1, height: 1 },
    };

    useDetectionStore.getState().setDetections([personA]);
    useDetectionStore.getState().setDetections([personB]);

    const state = useDetectionStore.getState();
    expect(state.detections).toEqual([personB]);
    expect(state.previousDetections).toEqual([personA]);
  });

  it('reset이 새 상태도 초기화', () => {
    useDetectionStore.getState().setStatsMode('per-second');
    useDetectionStore.getState().setDashboardTab('image-analysis');
    useDetectionStore.getState().addImageAnalysisResult({
      id: 'test-id',
      file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      imageUrl: 'blob:http://localhost/test',
      detections: [],
      inferenceTime: 10,
      analyzedAt: Date.now(),
    });

    useDetectionStore.getState().reset();

    const state = useDetectionStore.getState();
    expect(state.statsMode).toBe('unique');
    expect(state.dashboardTab).toBe('realtime');
    expect(state.imageAnalysisResults).toHaveLength(0);
    expect(state.previousDetections).toEqual([]);
    expect(state.uniqueDetectionCounts).toEqual({});
    expect(state.perSecondCounts).toEqual({});
  });
});
