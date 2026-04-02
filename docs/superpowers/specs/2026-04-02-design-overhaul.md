# AI Media Studio — 디자인 전면 리뉴얼 스펙

## 개요

대시보드(Service App)와 랜딩 페이지 전체 디자인을 리뉴얼한다. 현재 보라색 AI 그라데이션 + 남색 다크 배경의 제네릭한 미학에서 탈피하여, Clean Structural Dark 방향으로 전환한다.

**목표**: 프로페셔널하고 신뢰감 있는 미디어 분석 도구 UI. 온프레미스/프라이버시 중심 메시징.

---

## 1. 디자인 시스템

### 1.1 컬러 팔레트

**다크 모드 (기본)**

| 토큰           | 현재 값             | 변경 값                   | 비고             |
| -------------- | ------------------- | ------------------------- | ---------------- |
| `--background` | `240 33% 7%` (남색) | `0 0% 4%` (`#09090b`)     | 순수 뉴트럴 다크 |
| `--card`       | `240 40% 11%`       | `0 0% 7%`                 |                  |
| `--secondary`  | `240 30% 18%`       | `0 0% 11%`                |                  |
| `--muted`      | —                   | `0 0% 11%`                |                  |
| `--border`     | `240 25% 20%`       | `0 0% 15%`                |                  |
| `--input`      | —                   | `0 0% 15%`                |                  |
| `--primary`    | violet 계열         | `199 89% 48%` (`#0ea5e9`) | Electric Blue    |
| `--accent`     | violet 계열         | `199 89% 48%`             | 단일 액센트      |

**라이트 모드**: 동일한 Electric Blue 액센트, 배경은 `#fafafa` → `#f4f4f5` 그라데이션.

**시맨틱 컬러 (CSS 변수)**

```css
--ai-cyan: 199 89% 48%; /* 주 액센트 — Electric Blue */
--ai-cyan-muted: 199 60% 35%; /* 보조/호버 */
--ai-amber: 38 80% 55%; /* 경고/강조 유지 */
```

### 1.2 타이포그래피

| 용도            | 폰트       | 비고                                              |
| --------------- | ---------- | ------------------------------------------------- |
| 한국어 전체     | Pretendard | CDN: `cdn.jsdelivr.net/gh/orioncactus/pretendard` |
| 영문 디스플레이 | Geist      | 헤드라인, 숫자                                    |
| 코드/숫자       | Geist Mono | `font-variant-numeric: tabular-nums`              |

**한국어 텍스트 규칙**:

- `word-break: keep-all` (Tailwind: `break-keep-all`) 전체 한국어 블록
- 헤드라인: `leading-snug` (leading-none 금지)
- 헤드라인: `text-wrap: balance`
- 본문: `max-w-[65ch]`, `leading-relaxed`

### 1.3 아이콘

Iconify Solar set으로 통일.

```html
<script src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"></script>
<iconify-icon icon="solar:eye-linear"></iconify-icon>
```

현재 Lucide 아이콘은 단계적으로 Solar로 교체한다. 대시보드는 이미 lucide-react를 사용 중이므로, 랜딩 페이지부터 Solar를 적용하고 대시보드는 기존 Lucide 유지를 허용한다 (일관성보다 작업량 우선).

### 1.4 컴포넌트 패턴 — Double-Bezel Glass

**카드**:

```
외부 쉘: bg-white/[0.04] ring-1 ring-white/10 rounded-2xl p-1.5
내부 코어: bg-white/[0.03] rounded-[calc(1rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]
```

**CTA 버튼**:

```
rounded-full px-8 py-4 bg-[#0ea5e9] text-white font-semibold
화살표: w-8 h-8 rounded-full bg-black/15 내부에 → 아이콘
hover: scale-[1.02] + 화살표 translate-x-1
active: scale-[0.98]
transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1)
```

**Secondary 버튼**:

```
rounded-full bg-white/[0.04] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
```

**Input**:

```
bg-white/[0.03] ring-1 ring-white/10 rounded-xl
focus: ring-[#0ea5e9]/50
```

### 1.5 모션

**전역 트랜지션**: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1)` — 모든 인터랙티브 요소.

**GPU 안전 규칙**: `transform`과 `opacity`만 애니메이션. `top`, `left`, `width`, `height` 금지.

**backdrop-blur**: fixed/sticky 요소에만 허용 (네비게이션 등). 스크롤 콘텐츠에 사용 금지.

---

## 2. 대시보드 (Service App)

### 2.1 레이아웃 변경

**현재**: 사이드바 + 메인 콘텐츠
**변경**: 52px Icon-only Sidebar (좌) + 메인 콘텐츠 + 접이식 Settings Panel (우)

**Icon Sidebar (52px)**:

- 아이콘만 표시, 호버 시 툴팁
- 상단: 로고 (아이콘화)
- 중단: 실시간 감지, 이미지 분석, PDF 번역, 통계
- 하단: 설정(기어), 다크/라이트 토글
- 활성 탭: Electric Blue 배경 pill

**Settings Panel (우측)**:

- 기본 접힘 상태 (0px)
- 설정 아이콘 클릭 또는 각 페이지 설정 버튼으로 펼침 (280px)
- Ollama 설정, 모델 선택 등 이동
- 부드러운 슬라이드 트랜지션

### 2.2 색상 교체

모든 violet/purple 참조를 Electric Blue로 교체:

- `violet-500` → `sky-500` (또는 커스텀 `--ai-cyan`)
- `violet-400` → `sky-400`
- `bg-violet-500/10` → `bg-sky-500/10`
- `text-violet-400` → `text-sky-400`
- `hover:bg-violet-500/20` → `hover:bg-sky-500/20`

**대상 파일**:

- `apps/service/src/app/globals.css` — CSS 변수
- `apps/service/src/components/image-analysis/image-result-card.tsx`
- `apps/service/src/components/dashboard/sidebar.tsx`
- `apps/service/src/components/image-analysis/ocr-result-panel.tsx`
- `apps/service/src/components/image-analysis/ollama-settings.tsx`
- 기타 violet 참조가 있는 모든 파일

### 2.3 배경 변경

`globals.css`에서 모든 HSL 값의 hue를 `240`(남색)에서 `0`(뉴트럴)으로 변경.

---

## 3. 랜딩 페이지

### 3.1 기술 스택

| 라이브러리                | 용도                               | 버전    |
| ------------------------- | ---------------------------------- | ------- |
| Motion (구 Framer Motion) | 컴포넌트 애니메이션, 스크롤 트리거 | latest  |
| Lenis                     | 스무스 스크롤                      | latest  |
| Pretendard                | 한국어 폰트                        | CDN     |
| Geist                     | 영문 디스플레이 폰트               | CDN/npm |

### 3.2 섹션 구조

```
1. Navigation — Floating Glass Pill (backdrop-blur-xl, rounded-full, mt-4 mx-auto w-max)
2. Hero — Split Hero (60/40)
3. Metrics Strip — 숫자 카운팅 애니메이션
4. Features — Zig-Zag 교차 배치 (4개 기능)
5. Tech Stack — 사용 기술 표시
6. CTA — Full-bleed, 글로우 CTA 버튼
7. Footer — 미니멀 (로고, 링크, GitHub)
```

### 3.3 Hero Section (Split Hero 60/40)

**좌측 (60%)**:

- Eyebrow pill: `rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.15em] bg-sky-500/10 text-sky-500` — "온프레미스 AI 분석"
- 헤드라인: `text-4xl md:text-6xl font-extrabold tracking-tight leading-snug` — "브라우저 안에서 완결되는 AI"
- 서브텍스트: 서버 전송 없이 로컬 처리 설명
- CTA 2개: Primary pill ("무료로 시작하기" + 화살표 원형) + Ghost ("GitHub")

**우측 (40%)**:

- Double-Bezel 앱 프리뷰 목업
- Window chrome (3 dots) + 앱 UI 와이어프레임
- 미세한 float 애니메이션

**애니메이션**: 텍스트 staggered fadeInUp (각 요소 80ms 딜레이), 우측 목업 slideInRight + float.

### 3.4 Features Section (Zig-Zag)

4개 기능을 좌우 교차 배치:

1. **실시간 객체 감지** — 텍스트 좌, 비주얼 우
2. **얼굴 분석** — 비주얼 좌, 텍스트 우
3. **PDF 번역** — 텍스트 좌, 비주얼 우
4. **이미지 분석 (OCR)** — 비주얼 좌, 텍스트 우

각 기능:

- 아이콘 + 제목 + 2-3줄 설명
- 우측/좌측에 간략한 UI 프리뷰 또는 일러스트
- 스크롤 진입 시 텍스트와 비주얼이 양쪽에서 슬라이드인

### 3.5 애니메이션 상세

**Lenis 스무스 스크롤**:

```typescript
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
```

**섹션 진입 애니메이션** (Motion `whileInView`):

- Hero 텍스트: staggered fadeInUp + blur(4px→0)
- Metrics: 숫자 카운팅 (0 → 목표값)
- Features: 좌우에서 slideIn (각 row별 다른 방향)
- CTA: scale(0.95→1) + fadeIn

**패럴랙스**:

- Hero 배경 mesh gradient: 스크롤 시 느리게 이동 (`useScroll` + `useTransform`)
- Features 비주얼 요소: 스크롤 속도 차이로 depth 표현

**네비게이션**:

- 스크롤 다운 시 글래스 효과 강화 (`backdrop-blur` 증가)
- 모바일: 햄버거 → 풀스크린 오버레이, 링크 stagger reveal

### 3.6 콘텐츠 (온프레미스 메시징)

**헤드라인**: "브라우저 안에서 완결되는 AI"
**서브**: "웹캠 영상을 서버에 보내지 않습니다. 80종 객체 감지, 얼굴 분석, PDF 번역까지 모두 당신의 브라우저에서 실행됩니다."

**Metrics Strip**:

- 80+ 감지 가능 객체
- 30fps 실시간 처리
- 0원 API 비용
- 100% 프라이버시

**CTA**: "무료로 시작하기" → GitHub 레포, "직접 체험하기" → 데모 URL

### 3.7 반응형

- 모바일 (<768px): 단일 컬럼, `px-4 py-8`, Zig-Zag → 수직 스택
- 태블릿 (768-1024px): 2컬럼 유지, 패딩 축소
- 데스크톱 (>1024px): 풀 레이아웃, `max-w-7xl mx-auto px-8`
- `min-h-[100dvh]` 사용 (h-screen 금지)

---

## 4. 변경 범위

### 대시보드 수정 파일

- `apps/service/src/app/globals.css` — CSS 변수 전면 교체
- `apps/service/src/components/dashboard/sidebar.tsx` — Icon-only sidebar로 재설계
- `apps/service/src/components/image-analysis/image-result-card.tsx` — violet→sky
- `apps/service/src/components/image-analysis/ocr-result-panel.tsx` — violet→sky
- `apps/service/src/components/image-analysis/ollama-settings.tsx` — violet→sky
- 기타 violet 참조 파일 전수 조사 후 교체

### 랜딩 페이지 수정 파일

- `apps/landing/package.json` — motion, lenis 의존성 추가
- `apps/landing/src/app/layout.tsx` — Pretendard + Geist 폰트 설정
- `apps/landing/src/app/globals.css` — 색상 변수 교체
- `apps/landing/src/components/header.tsx` — Floating Glass Pill Nav
- `apps/landing/src/components/hero-section.tsx` — Split Hero 재설계
- `apps/landing/src/components/features-section.tsx` — Zig-Zag 재설계
- `apps/landing/src/components/stats-section.tsx` — 카운팅 애니메이션
- `apps/landing/src/components/how-it-works-section.tsx` — 스크롤 연출
- `apps/landing/src/components/cta-section.tsx` — Full-bleed CTA
- `apps/landing/src/components/footer.tsx` — 미니멀 재설계
- `apps/landing/src/components/tech-stack-section.tsx` — 기술 스택

### 새 파일

- `apps/landing/src/components/smooth-scroll-provider.tsx` — Lenis 래퍼
- `apps/landing/src/components/scroll-animation.tsx` — Motion whileInView 래퍼
- `apps/landing/src/components/metrics-strip.tsx` — 숫자 카운팅 컴포넌트

### 테스트

- 랜딩 페이지 기존 테스트 → 새 텍스트 어설션 업데이트
- 대시보드 사이드바 테스트 업데이트

---

## 5. 적용하지 않는 것

- GSAP (Motion으로 대체)
- Inter, Noto Sans KR, Roboto (Pretendard 통일)
- Purple/violet 계열 전부 제거
- 3-column equal card grid
- h-screen (min-h-[100dvh] 사용)
- backdrop-blur on 스크롤 콘텐츠
- 에모지 in 코드/UI (Iconify Solar 대체)
- AI 클리셰 카피 ("혁신적인", "차세대" 등)
