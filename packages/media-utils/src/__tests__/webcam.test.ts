import { describe, it, expect, vi } from 'vitest';
import { isWebcamSupported, startWebcam, stopWebcam } from '../webcam';

describe('isWebcamSupported', () => {
  it('navigator.mediaDevices.getUserMedia가 있으면 true 반환', () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn() },
    });
    expect(isWebcamSupported()).toBe(true);
    vi.unstubAllGlobals();
  });

  it('navigator.mediaDevices가 없으면 false 반환', () => {
    vi.stubGlobal('navigator', {});
    expect(isWebcamSupported()).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe('startWebcam', () => {
  it('getUserMedia를 호출하고 video에 stream을 설정', async () => {
    const mockStream = { getTracks: vi.fn(() => []) };
    const getUserMedia = vi.fn().mockResolvedValue(mockStream);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    const video = {
      srcObject: null,
      play: vi.fn().mockResolvedValue(undefined),
    } as unknown as HTMLVideoElement;

    const stream = await startWebcam(video);

    expect(getUserMedia).toHaveBeenCalledWith({
      video: expect.objectContaining({ facingMode: 'user' }),
      audio: false,
    });
    expect(video.srcObject).toBe(mockStream);
    expect(video.play).toHaveBeenCalled();
    expect(stream).toBe(mockStream);
    vi.unstubAllGlobals();
  });
});

describe('stopWebcam', () => {
  it('모든 트랙을 stop', () => {
    const track1 = { stop: vi.fn() };
    const track2 = { stop: vi.fn() };
    const stream = {
      getTracks: () => [track1, track2],
    } as unknown as MediaStream;

    stopWebcam(stream);

    expect(track1.stop).toHaveBeenCalled();
    expect(track2.stop).toHaveBeenCalled();
  });
});
