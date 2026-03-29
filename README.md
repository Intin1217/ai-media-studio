# AI Media Studio

브라우저에서 직접 AI 모델을 실행하여 웹캠 영상과 이미지를 실시간으로 분석하는 풀스택 웹 서비스입니다. 서버로 영상을 전송하지 않기 때문에 프라이버시가 보장되고, 네트워크 지연 없이 즉각적인 분석이 가능합니다.

**GitHub**: https://github.com/Intin1217/ai-media-studio

---

## 주요 기능

**실시간 웹캠 객체 감지**
웹캠 영상에 COCO-SSD 모델을 적용하여 80종 이상의 객체를 실시간으로 감지하고, Canvas 오버레이로 바운딩 박스와 라벨을 시각화합니다. 감지 통계를 3가지 모드(고유 감지 / 초당 감지 / 현재 프레임)로 전환하며 확인할 수 있고, FPS와 추론 시간을 포함한 실시간 성능 모니터도 함께 제공합니다.

**이미지 분석**
다중 이미지 드래그 앤 드롭 업로드를 지원하며, 업로드된 각 이미지에 동일한 모델로 객체 감지를 수행합니다. 결과는 바운딩 박스 오버레이가 적용된 갤러리 뷰로 확인할 수 있습니다.

**서비스 소개 랜딩 페이지**
히어로 섹션, 기능 소개, CTA로 구성된 정적 랜딩 페이지입니다. SSG로 빌드되어 SEO에 최적화되어 있습니다.

---

## 기술 스택

| 분류                 | 기술                                                             |
| -------------------- | ---------------------------------------------------------------- |
| Framework            | Next.js 15 (App Router), React 19                                |
| Language             | TypeScript 5 (strict mode)                                       |
| 서버 상태 관리       | TanStack React Query                                             |
| 클라이언트 상태 관리 | Zustand 5                                                        |
| 스타일링             | Tailwind CSS + cva 기반 커스텀 UI                                |
| AI / Media           | TensorFlow.js COCO-SSD (lite_mobilenet_v2), WebRTC, Canvas API   |
| 모노레포             | Turborepo + pnpm 10                                              |
| 최적화               | React Compiler (자동 메모이제이션)                               |
| 코드 품질            | ESLint 9 (flat config), Prettier, husky, lint-staged, commitlint |
| 테스트               | Vitest + React Testing Library + jsdom                           |
| 배포                 | Docker (multi-stage build, docker-compose)                       |
| CI/CD                | GitHub Actions (자동 코드 리뷰 + 자동 병합)                      |

---

## 프로젝트 구조

Turborepo 기반 모노레포입니다. 3개의 앱이 공유 패키지를 참조합니다.

```
ai-media-studio/
├── apps/
│   ├── service/        사용자용 AI 분석 서비스 (SSR, port 3000)
│   ├── admin/          관리자 어드민 패널 (SSG + CSR, port 3001)
│   └── landing/        서비스 소개 랜딩 페이지 (SSG, port 3002)
│
└── packages/
    ├── config/         공유 설정 (TSConfig, ESLint, Tailwind, Vitest, Prettier)
    ├── ui/             공유 UI 컴포넌트 (Button, Card, Badge, Progress, Tabs 등)
    ├── api-client/     Axios HTTP 클라이언트 + API 타입 정의
    └── media-utils/    WebRTC, MediaStream, Canvas 유틸리티 (테스트 99개)
```

앱별 렌더링 전략을 목적에 맞게 분리했습니다.

- **service**: SSR — 사용자별 동적 콘텐츠를 서버에서 렌더링
- **admin**: SSG + CSR — 정적 쉘을 미리 빌드하고, 데이터는 클라이언트에서 페칭
- **landing**: SSG — 완전 정적 페이지로 SEO 최적화

---

## 기술적 선택과 이유

### 왜 TensorFlow.js를 브라우저에서 실행하는가

1. **무료** — 외부 Vision API 호출 없이 브라우저에서 직접 실행하므로 API 비용이 없습니다.
2. **프라이버시** — 웹캠 영상이 서버로 전송되지 않습니다.
3. **실시간성** — 네트워크 왕복 없이 바로 추론하여 지연이 최소화됩니다.

COCO-SSD lite_mobilenet_v2 모델은 약 5MB로 가볍고, 모델 인스턴스를 싱글톤으로 관리하여 웹캠 감지와 이미지 분석이 동일한 인스턴스를 공유합니다. 덕분에 모델 로딩이 한 번만 발생하고, 페이지 이동 후에도 이전에 로드된 모델을 즉시 재사용합니다.

### 왜 React Query + Zustand인가

서버에서 오는 데이터(분석 이력, 설정값 등)는 React Query로, 브라우저에서만 존재하는 데이터(실시간 감지 결과, UI 상태)는 Zustand로 관리합니다. 역할이 명확히 나뉘어 있어 "이 상태를 어디에 둘 것인가"를 매번 고민할 필요가 없습니다.

### 왜 모노레포인가

3개 앱이 Button, Card 같은 UI 컴포넌트와 API 타입을 공유합니다. 모노레포를 쓰면 공유 코드 수정이 모든 앱에 즉시 반영되고, 하나의 PR에서 패키지 변경과 앱 변경을 함께 리뷰할 수 있습니다. Turborepo의 빌드 캐싱으로 CI 시간도 단축됩니다.

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

# 전체 개발 서버 실행 (3개 앱 동시)
pnpm dev

# 개별 앱 실행
pnpm --filter @ai-media-studio/service dev    # localhost:3000
pnpm --filter @ai-media-studio/admin dev      # localhost:3001
pnpm --filter @ai-media-studio/landing dev    # localhost:3002
```

### 빌드 및 품질 검사

```bash
pnpm build        # 전체 빌드
pnpm lint         # ESLint 검사
pnpm type-check   # TypeScript 타입 체크
pnpm test         # 테스트 실행
pnpm format       # Prettier 포맷팅
```

### Docker로 실행

```bash
# 전체 서비스 실행 (service + admin + landing)
docker compose up --build

# 백그라운드 실행
docker compose up --build -d

# 종료
docker compose down
```

Docker Compose로 3개 앱이 동시에 컨테이너로 실행됩니다. service와 admin은 Node.js standalone 이미지(multi-stage build), landing은 nginx:alpine으로 정적 파일을 서빙합니다.

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
- [x] Phase 1 — 랜딩 페이지 + Docker 인프라 + 테스트 환경
- [x] Phase 2 — 실시간 웹캠 객체 감지 대시보드
- [x] Phase 3 — 감지 통계 3종 모드 + 이미지 분석
- [ ] Phase 4 — 어드민 패널
- [ ] Phase 5 — 마무리 및 최적화
