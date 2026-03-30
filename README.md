# AI Media Studio

브라우저에서 직접 AI 모델을 실행하여 웹캠 영상과 이미지를 실시간으로 분석하는 온프레미스 웹 서비스입니다. 서버로 영상을 전송하지 않기 때문에 프라이버시가 보장되고, 네트워크 지연 없이 즉각적인 분석이 가능합니다.

**GitHub**: https://github.com/Intin1217/ai-media-studio

---

## 주요 기능

**실시간 웹캠 객체 감지**
웹캠 영상에 AI 모델(COCO-SSD / MediaPipe EfficientDet)을 적용하여 80종 이상의 객체를 실시간으로 감지하고, Canvas 오버레이로 바운딩 박스와 한국어 라벨을 시각화합니다. 3가지 모델(경량/균형/고정밀)을 실시간으로 전환할 수 있으며, 감지 통계를 3가지 모드(고유 감지 / 초당 감지 / 현재 프레임)로 확인할 수 있습니다. FPS와 추론 시간을 포함한 실시간 성능 모니터도 함께 제공합니다.

**이미지 분석**
다중 이미지 드래그 앤 드롭 업로드를 지원하며, 업로드된 각 이미지에 동일한 모델로 객체 감지를 수행합니다. 결과는 바운딩 박스 오버레이가 적용된 갤러리 뷰로 확인할 수 있습니다. 로컬 Ollama Vision 모델(Qwen3-VL 등)을 연결하면 각 이미지에 대한 AI 상세 분석도 가능합니다.

**통계 대시보드**
IndexedDB(Dexie)에 누적된 감지 히스토리를 Recharts로 시각화합니다. 객체 빈도 바차트, 카테고리 파이차트, 감지 추이 라인차트, 성능 히스토리 차트를 제공하며, 감지 임계값 설정과 CSV/JSON 내보내기 기능도 포함되어 있습니다.

**PDF 실시간 번역**
로컬 Ollama 모델을 활용한 PDF 문서 번역 기능입니다. pdfjs-dist로 PDF를 파싱하고, 텍스트 블록을 추출하여 배치 번역합니다. pretext 라이브러리로 번역된 텍스트의 레이아웃을 최적화하여 원본 레이아웃을 보존합니다. 원문/번역문 비교 사이드바와 호버 시 원문 확인 기능을 제공합니다.

**OCR 텍스트 추출**
이미지에서 텍스트를 추출하는 듀얼 엔진 OCR입니다. Tesseract.js(WASM, 브라우저 내 실행)를 기본 엔진으로 사용하고, Ollama Vision 모델을 보조 엔진으로 활용합니다. 추출된 텍스트는 클립보드 복사가 가능합니다.

**다크모드**
next-themes 기반으로 다크/라이트 테마 토글을 지원합니다. 시스템 설정을 자동으로 감지하며, 선택한 테마는 localStorage에 유지됩니다.

---

## 기술 스택

| 분류                 | 기술                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Framework            | Next.js 15 (App Router), React 19                                                                                           |
| Language             | TypeScript 5 (strict mode)                                                                                                  |
| 클라이언트 상태 관리 | Zustand 5                                                                                                                   |
| 다크모드             | next-themes                                                                                                                 |
| 클라이언트 DB        | Dexie (IndexedDB)                                                                                                           |
| 차트                 | Recharts                                                                                                                    |
| 스타일링             | Tailwind CSS + cva 기반 커스텀 UI                                                                                           |
| AI / Media           | TensorFlow.js COCO-SSD, MediaPipe EfficientDet, Ollama Vision (선택), WebRTC, Canvas API, pdfjs-dist, Tesseract.js, pretext |
| 모노레포             | Turborepo + pnpm 10                                                                                                         |
| 최적화               | React Compiler (자동 메모이제이션)                                                                                          |
| 코드 품질            | ESLint 9 (flat config), Prettier, husky, lint-staged, commitlint                                                            |
| 테스트               | Vitest + React Testing Library + jsdom                                                                                      |
| 배포                 | Docker (multi-stage build, docker-compose)                                                                                  |
| CI/CD                | GitHub Actions (자동 코드 리뷰 + 자동 병합)                                                                                 |

---

## 프로젝트 구조

Turborepo 기반 모노레포입니다. 두 앱이 공유 패키지를 참조합니다.

```
ai-media-studio/
├── apps/
│   ├── service/        AI 분석 대시보드 (SSR, port 3000)
│   └── landing/        랜딩 페이지 (SSG, port 3002)
│
└── packages/
    ├── config/         공유 설정 (TSConfig, ESLint, Tailwind, Vitest, Prettier)
    ├── ui/             공유 UI 컴포넌트 (Button, Card, Badge, Progress, Tabs 등)
    ├── api-client/     Axios HTTP 클라이언트 + API 타입 정의
    ├── media-utils/    WebRTC, MediaStream, Canvas 유틸리티 (테스트 99개)
    ├── pdf-engine/     PDF 파싱 + 번역 + 레이아웃 엔진 (pdfjs-dist, pretext)
    └── ocr/            OCR 엔진 (Tesseract.js + Ollama Vision)
```

---

## 기술적 선택과 이유

### 왜 TensorFlow.js를 브라우저에서 실행하는가

1. **무료** — 외부 Vision API 호출 없이 브라우저에서 직접 실행하므로 API 비용이 없습니다.
2. **프라이버시** — 웹캠 영상이 서버로 전송되지 않습니다.
3. **실시간성** — 네트워크 왕복 없이 바로 추론하여 지연이 최소화됩니다.

COCO-SSD lite_mobilenet_v2 모델은 약 5MB로 가볍고, 모델 인스턴스를 싱글톤으로 관리하여 웹캠 감지와 이미지 분석이 동일한 인스턴스를 공유합니다. 덕분에 모델 로딩이 한 번만 발생하고, 페이지 이동 후에도 이전에 로드된 모델을 즉시 재사용합니다.

### 왜 MediaPipe를 추가했는가

COCO-SSD만으로는 복잡한 장면(사람이 물건을 들고 있는 경우 등)에서 인식 정확도가 떨어졌습니다. MediaPipe EfficientDet Lite0/Lite2를 추가하여 정확도와 속도 사이에서 사용자가 직접 선택할 수 있게 했습니다. ModelProvider 인터페이스로 두 엔진을 추상화하여, 모델 전환 시 감지 루프를 안전하게 중단/재시작하는 Strategy 패턴을 적용했습니다.

### 왜 로컬 LLM을 실시간 감지에 쓰지 않는가

LLM(Qwen3-VL 등)은 프레임당 2-10초가 걸려 실시간 감지(30fps 이상)에는 구조적으로 부적합합니다. 또한 7B 모델은 6GB 이상이라 브라우저에 올릴 수 없고, HTTP로 매 프레임 이미지를 전송하면 대역폭과 보안(평문 전송) 문제가 발생합니다. 따라서 실시간 감지는 브라우저 경량 모델(COCO-SSD/MediaPipe), 상세 분석은 로컬 Ollama로 역할을 분리하는 하이브리드 아키텍처를 채택했습니다.

### 왜 Zustand인가

서버 API 호출이 없는 프론트엔드 전용 프로젝트에서 React Query는 불필요한 의존성입니다. 실시간 감지 결과, UI 상태 등 브라우저에서만 존재하는 클라이언트 상태는 Zustand로 관리하고, 세션 간 유지가 필요한 영속 데이터(감지 히스토리)는 Dexie(IndexedDB)로 분리했습니다. "안 쓰는 기술을 제거하는 것도 설계 결정"이라는 판단 하에 React Query를 제거했습니다.

### 왜 모노레포인가

앱과 공유 패키지가 Button, Card 같은 UI 컴포넌트와 API 타입을 공유합니다. 모노레포를 쓰면 공유 코드 수정이 즉시 앱에 반영되고, 하나의 PR에서 패키지 변경과 앱 변경을 함께 리뷰할 수 있습니다. Turborepo의 빌드 캐싱으로 CI 시간도 단축됩니다.

### 왜 React Compiler인가

React 19와 함께 도입된 React Compiler를 사용하여 `useMemo`, `useCallback`, `memo` 없이도 자동 메모이제이션이 적용됩니다. 실시간 감지 루프처럼 렌더링이 빈번한 컴포넌트에서 수동 최적화 코드를 줄이면서도 성능을 유지할 수 있습니다.

---

## 시작하기

### 사전 요구사항

- Node.js 20 이상
- pnpm 10 이상

### 개발 서버 실행

```bash
# 저장소 클론
git clone https://github.com/Intin1217/ai-media-studio.git
cd ai-media-studio

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev    # localhost:3000 대시보드 접속
```

### 로컬 AI 상세 분석 (선택)

Ollama를 설치하면 이미지 분석 탭에서 Vision 모델 기반 상세 분석을 사용할 수 있습니다.

```bash
# Ollama 설치 후
ollama pull qwen3-vl:8b
```

이미지 분석 탭에서 "로컬 AI 상세 분석" 토글을 켜고 연결하면 됩니다. Ollama 없이도 브라우저 모델로 기본 객체 감지는 정상 작동합니다.

### 빌드 및 품질 검사

```bash
pnpm build        # 전체 빌드
pnpm lint         # ESLint 검사
pnpm type-check   # TypeScript 타입 체크
pnpm test         # 테스트 실행
pnpm format       # Prettier 포맷팅
```

### Docker로 실행 (온프레미스)

```bash
# 서비스 실행
docker compose up --build

# 백그라운드 실행
docker compose up --build -d

# 종료
docker compose down
```

`docker compose up` 실행 후 `localhost:3000`에서 대시보드에 바로 접속합니다. service는 Node.js standalone 이미지(multi-stage build)로 컨테이너화되어 있습니다.

---

## 커밋 컨벤션

Conventional Commits를 사용합니다. commitlint로 자동 검증됩니다.

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅 (기능 변경 없음)
refactor: 리팩토링
test: 테스트 추가/수정
chore: 기타 변경
```

---

## 진행 상황

- [x] Phase 0 — 모노레포 기반 세팅
- [x] Phase 1 — Docker 인프라 + 테스트 환경
- [x] Phase 2 — 실시간 웹캠 객체 감지 대시보드
- [x] Phase 3 — 감지 통계 3종 모드 + 이미지 분석
- [x] Phase 4 — 통계 대시보드 + 다크모드 + UI 개선
- [x] Phase 5 — 마무리 정리 (admin 제거, 테스트, 최적화)
- [x] Phase 6 — 온프레미스 전환 + PDF 번역/OCR 엔진 추가
