#!/usr/bin/env bash
set -euo pipefail

# ── FlowFinance Linux Server Setup Script ──────────────────────────
# Run this on a fresh Ubuntu 22.04+ / Debian 12+ server to install
# all prerequisites for running FlowFinance with Docker.
#
# Usage: sudo bash ./deploy/linux/setup.sh

echo "🖥️  FlowFinance — Server Setup"
echo "================================"

# 1. System packages
echo "📦 Installing system packages..."
apt-get update -qq
apt-get install -y -qq \
  curl \
  git \
  ufw \
  apt-transport-https \
  ca-certificates \
  software-properties-common \
  gnupg \
  lsb-release

# 2. Docker
if ! command -v docker &> /dev/null; then
  echo "🐳 Installing Docker..."
  curl -fsSL https://get.docker.com | bash
  systemctl enable --now docker
else
  echo "✅ Docker already installed"
fi

# 3. docker-compose plugin
if ! docker compose version &> /dev/null; then
  echo "🐳 Installing docker-compose plugin..."
  DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker/cli-plugins}
  mkdir -p "$DOCKER_CONFIG"
  curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o "$DOCKER_CONFIG/docker-compose"
  chmod +x "$DOCKER_CONFIG/docker-compose"
else
  echo "✅ docker-compose already installed"
fi

# 4. Firewall
echo "🔒 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 3000/tcp comment "FlowFinance Web"
ufw --force enable

# 5. Clone repository (if not already cloned)
if [ ! -f "docker-compose.yml" ]; then
  echo "📂 Cloning FlowFinance..."
  git clone https://github.com/anomalyco/flowfinance.git /opt/flowfinance
  cd /opt/flowfinance
else
  echo "✅ Repository already present"
fi

# 6. .env check
if [ ! -f .env ]; then
  echo ""
  echo "⚠️  IMPORTANT: Create .env file before deploying!"
  echo "   cp .env.example .env"
  echo "   nano .env"
  echo ""
  echo "   Required variables:"
  echo "     - DATABASE_URL"
  echo "     - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  echo "     - CLERK_SECRET_KEY"
  echo "     - TELEGRAM_BOT_TOKEN"
  echo ""
  echo "   Then run: bash deploy/linux/deploy.sh"
else
  echo "✅ .env file found"
  echo "   Run deploy: bash deploy/linux/deploy.sh"
fi

echo ""
echo "✅ Setup complete!"
echo "   Next step: configure .env and run deploy/linux/deploy.sh"
