import type { WebcamConfig } from './types';

export function isWebcamSupported(): boolean {
  return !!navigator?.mediaDevices?.getUserMedia;
}

export async function startWebcam(
  video: HTMLVideoElement,
  config: WebcamConfig = {},
): Promise<MediaStream> {
  const { width = 640, height = 480, facingMode = 'user' } = config;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: width }, height: { ideal: height }, facingMode },
    audio: false,
  });

  video.srcObject = stream;
  await video.play();

  return stream;
}

export function stopWebcam(
  stream: MediaStream | null,
  video?: HTMLVideoElement | null,
): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  if (video) {
    video.srcObject = null;
  }
}
