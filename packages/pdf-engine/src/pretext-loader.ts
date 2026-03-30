// @chenglou/pretext optional peer dependency를 안전하게 로드하기 위한 모듈
// 이 파일을 별도로 분리해서 테스트에서 모킹 가능하게 함

export interface PretextModule {
  prepare: (text: string) => unknown;
  layout: (
    prepared: unknown,
    width: number,
    lineHeight: number,
  ) => { height: number };
}

let cached: PretextModule | null = null;
let attempted = false;

export async function loadPretextModule(): Promise<PretextModule | null> {
  if (attempted) return cached;
  attempted = true;
  try {
    const mod = (await import('@chenglou/pretext')) as unknown as PretextModule;
    cached = mod;
    return cached;
  } catch {
    return null;
  }
}

// 테스트에서 주입하기 위한 훅
export function _resetPretextCache() {
  cached = null;
  attempted = false;
}
