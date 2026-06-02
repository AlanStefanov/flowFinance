FROM node:24-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma
RUN node node_modules/prisma/build/index.js generate

# Build Next.js
COPY . .
RUN npm run build

# Production image
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy everything needed at runtime: standalone + prisma CLI + node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Startup script
RUN printf '%s\n' \
  '#!/bin/sh' \
  'echo "⏳ Waiting for MySQL..."' \
  'for i in $(seq 1 30); do' \
  '  node -e "require(\"net\").createConnection({host:\"mysql\",port:3306}).on(\"error\",()=>{}).on(\"connect\",()=>process.exit(0))" 2>/dev/null && break' \
  '  echo "   waiting for mysql... ($i)"' \
  '  sleep 2' \
  'done' \
  'echo "📦 Running migrations..."' \
  'node node_modules/prisma/build/index.js migrate deploy 2>&1 || echo "⚠️ Migration failed"' \
  'echo "🚀 Starting web..."' \
  'exec node server.js' > /app/start.sh && chmod +x /app/start.sh

USER nodejs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["/app/start.sh"]
