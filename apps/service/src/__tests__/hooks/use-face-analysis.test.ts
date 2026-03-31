import { describe, it, expect, vi } from 'vitest';

vi.mock('face-api.js', () => ({
  nets: {
    ssdMobilenetv1: { loadFromUri: vi.fn().mockResolvedValue(undefined) },
    ageGenderNet: { loadFromUri: vi.fn().mockResolvedValue(undefined) },
    faceLandmark68Net: { loadFromUri: vi.fn().mockResolvedValue(undefined) },
  },
  detectAllFaces: vi.fn().mockReturnValue({
    withFaceLandmarks: vi.fn().mockReturnValue({
      withAgeAndGender: vi.fn().mockResolvedValue([]),
    }),
  }),
  SsdMobilenetv1Options: vi.fn(),
}));

describe('useFaceAnalysis', () => {
  it('모듈이 올바르게 export된다', async () => {
    const mod = await import('@/hooks/use-face-analysis');
    expect(mod.useFaceAnalysis).toBeDefined();
    expect(typeof mod.useFaceAnalysis).toBe('function');
  });
});
