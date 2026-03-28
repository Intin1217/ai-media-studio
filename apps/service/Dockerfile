# Stage 1: base — Node.js + pnpm setup
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

# Stage 2: deps — install all dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/config/package.json packages/config/
COPY packages/ui/package.json packages/ui/
COPY packages/api-client/package.json packages/api-client/
COPY packages/media-utils/package.json packages/media-utils/
COPY apps/service/package.json apps/service/
RUN pnpm install --frozen-lockfile

# Stage 3: builder — compile the service app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/api-client/node_modules ./packages/api-client/node_modules
COPY --from=deps /app/packages/media-utils/node_modules ./packages/media-utils/node_modules
COPY --from=deps /app/apps/service/node_modules ./apps/service/node_modules
COPY . .
RUN pnpm turbo run build --filter=@ai-media-studio/service

# Stage 4: runner — minimal production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy standalone output (includes all necessary node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/apps/service/.next/standalone ./
# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/service/.next/static ./apps/service/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/service/server.js"]
