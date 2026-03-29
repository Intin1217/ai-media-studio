export type {
  BoundingBox,
  Detection,
  DrawOptions,
  WebcamConfig,
} from './types';
export { isWebcamSupported, startWebcam, stopWebcam } from './webcam';
export {
  clearCanvas,
  getColorForClass,
  drawBoundingBox,
  drawLabel,
  drawDetections,
} from './canvas';
