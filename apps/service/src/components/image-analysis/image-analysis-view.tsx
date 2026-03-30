'use client';

import { ImageUpload } from './image-upload';
import { ImageResultGallery } from './image-result-gallery';
import { OllamaSettings } from './ollama-settings';
import { ModelLoader } from '@/components/detection/model-loader';

export function ImageAnalysisView() {
  return (
    <div className="flex flex-col gap-6">
      <ModelLoader />
      <OllamaSettings />
      <ImageUpload />
      <ImageResultGallery />
    </div>
  );
}
