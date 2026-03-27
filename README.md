# AI Media Studio

웹캠으로 실시간 영상을 캡처하고, TensorFlow.js로 객체를 감지한 뒤, 그 결과를 실시간 오버레이와 통계 차트로 보여주는 웹 서비스입니다.

## 프로젝트 소개

브라우저에서 직접 AI 모델을 실행하여 실시간으로 객체를 감지하고, 분석 결과를 시각화합니다. 서버로 영상을 전송하지 않기 때문에 프라이버시가 보장되고, 네트워크 지연 없이 빠른 분석이 가능합니다.

### 주요 기능

- 웹캠 실시간 영상 캡처 및 AI 객체 감지
- Canvas 오버레이를 통한 바운딩 박스 시각화
- 실시간 통계 대시보드 (감지 객체 추이, 카테고리별 비율)
- 커스텀 비디오 플레이어 (키보드 접근성, 스크린 리더 대응)
- 관리자 어드민 패널

## 기술 스택

| 분류       | 기술                                             |
| ---------- | ------------------------------------------------ |
| Framework  | Next.js 15 (App Router)                          |
| Language   | TypeScript 5 (strict mode)                       |
| 상태 관리  | React Query + Zustand                            |
| 스타일링   | Tailwind CSS, shadcn/ui                          |
| AI / Media | TensorFlow.js (COCO-SSD), WebRTC, Canvas API     |
| 모노레포   | Turborepo + pnpm                                 |
| 코드 품질  | ESLint, Prettier, husky, lint-staged, commitlint |
| 배포       | Vercel                                           |

## 프로젝트 구조

Turborepo 기반 모노레포로 구성했습니다. 3개의 앱이 공유 패키지를 참조하는 구조입니다.

```
apps/
  service/        사용자용 AI 분석 서비스 (SSR)
  admin/          관리자 어드민 패널 (SSG + CSR)
  landing/        서비스 소개 페이지 (SSG)

packages/
  config/         공유 설정 (TSConfig, ESLint, Tailwind)
  ui/             공유 UI 컴포넌트
  api-client/     HTTP 클라이언트 + API 타입
  media-utils/    WebRTC, Canvas 유틸리티
```

앱별로 렌더링 전략을 다르게 가져갔습니다.

- **service**: SSR — 사용자별 동적 콘텐츠를 서버에서 렌더링
- **admin**: SSG + CSR — 정적 쉘을 미리 빌드하고, 데이터는 클라이언트에서 페칭
- **landing**: SSG — 완전 정적 페이지로 SEO 최적화

## 기술적 선택과 이유

### 왜 모노레포인가

3개 앱이 Button, Card 같은 UI 컴포넌트와 API 타입을 공유합니다. 모노레포를 쓰면 공유 코드를 수정했을 때 모든 앱에 즉시 반영되고, 하나의 PR에서 패키지 변경과 앱 변경을 함께 리뷰할 수 있습니다.

### 왜 TensorFlow.js를 브라우저에서 실행하는가

1. 비용이 들지 않습니다 — 외부 API 호출 없이 브라우저에서 직접 실행
2. 프라이버시 — 웹캠 영상이 외부 서버로 전송되지 않음
3. 실시간성 — 네트워크 왕복 없이 바로 분석 가능

COCO-SSD 모델은 약 5MB로 가볍고, Web Worker로 메인 스레드와 분리하여 UI가 버벅이지 않도록 했습니다.

### 왜 React Query + Zustand인가

서버에서 오는 데이터(분석 이력, 설정값 등)는 React Query로 관리하고, 브라우저에서만 존재하는 데이터(실시간 감지 결과, UI 상태)는 Zustand로 관리합니다. 역할이 명확히 나뉘어 있어서 "이 상태를 어디에 둘 것인가"로 고민할 일이 없습니다.

## 시작하기

### 사전 요구사항

- Node.js 20 이상
- pnpm 10 이상

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/Intin1217/ai-media-studio.git
cd ai-media-studio

# 의존성 설치
pnpm install

# 전체 개발 서버 실행
pnpm dev

# 개별 앱 실행
pnpm --filter @ai-media-studio/service dev    # localhost:3000
pnpm --filter @ai-media-studio/admin dev      # localhost:3001
pnpm --filter @ai-media-studio/landing dev    # localhost:3002
```

### 빌드

```bash
pnpm build        # 전체 빌드
pnpm lint         # 린트
pnpm type-check   # 타입 체크
```

## 커밋 컨벤션

Conventional Commits를 사용합니다. commitlint로 검증됩니다.

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅 (기능 변경 없음)
refactor: 리팩토링
test: 테스트 추가/수정
chore: 기타 변경
```

## 진행 상황

- [x] Phase 0 — 모노레포 기반 세팅
- [ ] Phase 1 — 랜딩 페이지 (SEO, 접근성, 반응형)
- [ ] Phase 2 — 정적 이미지 분석 (TensorFlow.js 연동)
- [ ] Phase 3 — 실시간 분석 (WebRTC, Web Worker, 성능 최적화)
- [ ] Phase 4 — 실시간 통계 대시보드
- [ ] Phase 5 — 어드민 패널
- [ ] Phase 6 — 마무리 및 최적화
