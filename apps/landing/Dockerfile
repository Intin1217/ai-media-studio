# Stage 1: base — Node.js + pnpm setup
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

# Stage 2: deps — install all dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/config/package.json packages/config/
COPY packages/ui/package.json packages/ui/
COPY apps/landing/package.json apps/landing/
RUN pnpm install --frozen-lockfile

# Stage 3: builder — static export
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/apps/landing/node_modules ./apps/landing/node_modules
COPY . .
RUN pnpm turbo run build --filter=@ai-media-studio/landing

# Stage 4: runner — nginx serves static files
FROM nginx:alpine AS runner
COPY apps/landing/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/landing/out /usr/share/nginx/html
EXPOSE 3002
