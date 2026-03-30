import { describe, it, expect } from 'vitest';
import { getKoreanLabel, CLASS_LABELS_KO } from '@/lib/class-labels';

describe('getKoreanLabel', () => {
  it('알려진 클래스명을 한국어로 변환', () => {
    expect(getKoreanLabel('person')).toBe('사람');
    expect(getKoreanLabel('car')).toBe('자동차');
    expect(getKoreanLabel('dog')).toBe('강아지');
    expect(getKoreanLabel('cat')).toBe('고양이');
    expect(getKoreanLabel('bicycle')).toBe('자전거');
  });

  it('대소문자 구분 없이 변환', () => {
    expect(getKoreanLabel('Person')).toBe('사람');
    expect(getKoreanLabel('CAR')).toBe('자동차');
    expect(getKoreanLabel('DOG')).toBe('강아지');
  });

  it('모르는 클래스명은 원본 반환', () => {
    expect(getKoreanLabel('unknown_class')).toBe('unknown_class');
    expect(getKoreanLabel('xyz')).toBe('xyz');
  });

  it('공백 포함 클래스명도 변환', () => {
    expect(getKoreanLabel('traffic light')).toBe('신호등');
    expect(getKoreanLabel('cell phone')).toBe('휴대폰');
    expect(getKoreanLabel('hot dog')).toBe('핫도그');
  });

  it('CLASS_LABELS_KO에 충분한 수의 항목이 존재', () => {
    expect(Object.keys(CLASS_LABELS_KO).length).toBeGreaterThanOrEqual(70);
  });
});
