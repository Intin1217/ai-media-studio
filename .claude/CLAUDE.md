# AI Media Studio

## 프로젝트 개요
웹캠으로 실시간 영상을 캡처하고, TensorFlow.js로 객체를 감지한 뒤, 그 결과를 실시간 오버레이와 통계 차트로 보여주는 서비스 + 관리자 어드민.

## 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **상태 관리**: React Query (서버 상태) + Zustand (클라이언트 상태)
- **스타일링**: Tailwind CSS + shadcn/ui (어드민)
- **AI/Media**: TensorFlow.js + COCO-SSD, WebRTC, Canvas API
- **모노레포**: Turborepo + pnpm
- **코드 품질**: husky + lint-staged + commitlint (conventional commits)
- **배포**: Docker (docker-compose)

## 모노레포 구조
```
apps/
  service/     → 사용자용 AI 분석 서비스 (SSR, port 3000)
  admin/       → 관리자 어드민 (SSG+CSR, port 3001)
  landing/     → 서비스 소개 랜딩 (SSG, port 3002)

packages/
  config/      → 공유 설정 (TSConfig, ESLint, Tailwind, Prettier)
  ui/          → 공유 UI 컴포넌트 (Button, Input, Card 등)
  api-client/  → Axios HTTP 클라이언트 + API 타입 정의
  media-utils/ → WebRTC, MediaStream, Canvas 유틸리티
```

## 실행 방법
```bash
# 의존성 설치
pnpm install

# 전체 개발 서버 실행 (3개 앱 동시)
pnpm dev

# 개별 앱 실행
pnpm --filter @ai-media-studio/service dev    # localhost:3000
pnpm --filter @ai-media-studio/admin dev      # localhost:3001
pnpm --filter @ai-media-studio/landing dev    # localhost:3002

# 빌드
pnpm build

# 린트 + 타입 체크
pnpm lint
pnpm type-check

# 포맷팅
pnpm format
```

## 커밋 컨벤션
commitlint + conventional commits 사용:
- `feat: 새 기능 추가`
- `fix: 버그 수정`
- `docs: 문서 변경`
- `style: 코드 포맷팅`
- `refactor: 리팩토링`
- `test: 테스트`
- `chore: 기타 변경`

## 주의사항
- 앱의 `tailwind.config.ts`에 `../../packages/ui/src/**/*` content 경로 필수
- 앱의 `next.config.ts`에 workspace 패키지 `transpilePackages` 필수
- packages/ui의 react는 `peerDependencies`로 선언 (dependencies 아님)
- tsconfig의 `extends`는 상대 경로 사용 (pnpm 호환)

## 브랜치 전략
- `main` — 릴리스 브랜치 (안정 버전)
- `dev` — 통합 브랜치 (feature 브랜치들이 여기로 병합)
- `feature/*` — 기능 브랜치 (dev에서 분기, dev로 PR)

### 작업 흐름
1. `dev`에서 `feature/<이름>` 브랜치 생성
2. 작업 완료 후 `feature/*` → `dev` PR 생성
3. Claude Code Review 자동 실행 → 자동 승인 → 병합
4. `dev` → `main` PR은 수동 리뷰 후 병합

## 커밋 & PR 규칙
- **커밋 메시지**: 한국어로 작성. 단, type prefix는 영어 소문자 (commitlint 규칙)
  - 예: `feat: 랜딩 페이지 히어로 섹션 구현`
  - 예: `fix: 객체 감지 바운딩 박스 위치 보정`
- **PR 제목**: 한국어로 작성
  - 예: `feat: 실시간 객체 감지 대시보드 구현`
- **PR 본문**: 한국어로 작성. 아래 형식 사용:
  ```
  ## 요약
  - 변경 내용 1
  - 변경 내용 2

  ## 테스트
  - [ ] 테스트 항목 1
  - [ ] 테스트 항목 2
  ```
- **Co-Authored-By 트레일러 금지**: 커밋에 절대 붙이지 않기

## 에이전트 워크플로우
서브 에이전트가 코드 작업을 완료하면 반드시 다음 단계를 수행:

1. **feature 브랜치 생성**: `feature/<작업명>` 형식으로 dev에서 분기
2. **커밋**: 한국어 커밋 메시지로 커밋 (Co-Authored-By 금지)
3. **push**: `git push origin feature/<작업명>`
4. **PR 생성**: `gh pr create --base dev` 로 dev 브랜치에 PR 생성
   - PR 제목과 본문은 한국어
   - 본문에 요약과 테스트 섹션 포함

### pnpm 명령어 주의
- `pnpm --filter @scope/pkg <cmd>` (O)
- `pnpm <cmd> --filter @scope/pkg` (X) — 동작하지 않음
