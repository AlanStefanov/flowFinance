#!/bin/bash
set -e

# ============================================
# FlowFinance - Installation Script
# ============================================

echo "🚀 FlowFinance Installation Script"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Step 1: Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and fill in your credentials:"
    echo "   1. Get Clerk keys from: https://clerk.com"
    echo "   2. Get Telegram bot token from @BotFather on Telegram"
    echo ""
    read -p "Press Enter after you've configured .env file..."
else
    echo "✅ .env file already exists"
fi

# Step 2: Check if .env has real values (not placeholders)
if grep -q "YOUR_KEY_HERE\|123456789:ABCdefGHIjklMNOpqrsTUVwxyZ" .env 2>/dev/null; then
    echo ""
    echo "⚠️  Warning: .env still has placeholder values!"
    echo "   Please edit .env with your real credentials."
    read -p "Press Enter after editing .env file..."
fi

# Step 3: Clean up any existing containers (optional, with prompt)
if docker ps -a --filter "name=flowfinance" --format "{{.Names}}" | grep -q flowfinance; then
    echo ""
    echo "🧹 Found existing FlowFinance containers."
    read -p "Do you want to remove them and start fresh? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping and removing old containers..."
        docker compose down -v 2>/dev/null || true
        docker rm -f flowfinance-mysql flowfinance-web flowfinance-bot 2>/dev/null || true
        docker volume rm flowfinance_mysql_data 2>/dev/null || true
        echo "✅ Cleanup complete"
    fi
fi

# Step 4: Build and start all services
echo ""
echo "🏗️  Building and starting all services with Docker Compose..."
echo "   (This may take a few minutes on first run)"
echo ""

docker compose up --build -d

# Step 5: Wait for MySQL to be ready
echo ""
echo "⏳️  Waiting for MySQL to be ready..."
for i in {1..30}; do
    if docker exec flowfinance-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo "✅ MySQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MySQL failed to start in time"
        exit 1
    fi
    sleep 2
done

# Step 6: Push Prisma schema to database
echo ""
echo "📊 Pushing database schema..."
docker exec flowfinance-web npx prisma db push 2>/dev/null || \
    echo "⚠️  Couldn't push schema. You may need to do it manually later."

# Step 7: Show status
echo ""
echo "================================"
echo "✅ Installation Complete!"
echo "================================"
echo ""
echo "📊 Services running:"
docker compose ps
echo ""
echo "🌐 Access your app at:"
echo "   http://localhost:${PORT:-3000}"
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker compose logs -f"
echo "   Stop all:      docker compose down"
echo "   Restart all:   docker compose restart"
echo ""
echo "🤖 To use the Telegram bot:"
echo "   1. Message @BotFather on Telegram"
echo "   2. Use /start YOUR_CODE to link your account"
echo ""
