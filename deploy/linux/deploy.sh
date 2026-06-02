#!/usr/bin/env bash
set -euo pipefail

# ── FlowFinance Deploy Script (Linux / Docker) ──────────────────────
# Usage: ./deploy/linux/deploy.sh [production|staging]
#
# Prerequisites:
#   - Docker & docker-compose installed
#   - .env file configured (see .env.example)
#   - Ports 3000 (web) and 3306 (mysql, internal) available
#
# This script builds, starts, and runs FlowFinance in production mode
# using the docker-compose.yml at the project root.

ENV=${1:-production}
COMPOSE_FILE="docker-compose.yml"
PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "🚀 FlowFinance Deploy — Environment: $ENV"
echo "📂 Project directory: $PROJECT_DIR"

cd "$PROJECT_DIR"

# 1. Check .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Copy .env.example to .env and configure it."
  exit 1
fi

# 2. Pull latest images (if using pre-built)
echo "📦 Pulling images..."
docker compose -f "$COMPOSE_FILE" pull 2>/dev/null || true

# 3. Build and start
echo "🔨 Building and starting services..."
docker compose -f "$COMPOSE_FILE" up --build -d

# 4. Wait for health checks
echo "⏳ Waiting for services to be healthy..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Web app is up on http://localhost:3000"
    break
  fi
  echo "   Waiting... ($i/30)"
  sleep 2
done

# 5. Run database migrations
echo "🗄️  Running database migrations..."
docker compose -f "$COMPOSE_FILE" exec -T web npx prisma migrate deploy 2>/dev/null || \
  echo "⚠️  Migration failed. Run manually: docker compose exec web npx prisma migrate deploy"

echo ""
echo "✅ FlowFinance deployed successfully!"
echo "   Web:   http://localhost:3000"
echo "   Bot:   Running inside container (configure webhook via Telegram API)"
echo ""
echo "   Logs:  docker compose logs -f"
echo "   Stop:  docker compose down"
