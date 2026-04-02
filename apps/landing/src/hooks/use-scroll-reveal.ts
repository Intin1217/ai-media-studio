'use client';

// use-scroll-reveal — Motion으로 대체됨. 빈 훅으로 유지하여 기존 import 호환성 보존.
import { useRef, type RefObject } from 'react';

export function useScrollReveal<T extends HTMLElement>(): RefObject<T | null> {
  return useRef<T>(null);
}
