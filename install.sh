#!/bin/bash
set -e

echo "============================================"
echo "  StreamVault Web — Installation Script"
echo "============================================"
echo ""

# Check Docker is installed
if ! command -v docker &> /dev/null; then
  echo "ERROR: Docker is not installed. Install it first:"
  echo "  https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "ERROR: Docker Compose is not available."
  echo "  Install Docker Compose v2: https://docs.docker.com/compose/install/"
  exit 1
fi

echo "Docker found: $(docker --version)"
echo ""

# Generate secrets
generate_secret() {
  openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p -c 64 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || echo "changeme-$(date +%s)-$RANDOM"
}

# Domain
read -p "Domain (e.g. stream.example.com, or localhost for local): " DOMAIN
DOMAIN=${DOMAIN:-localhost}

# TMDB API Key
echo ""
echo "Get a free TMDB API key at: https://www.themoviedb.org/settings/api"
read -p "TMDB API Key (press Enter to skip): " TMDB_API_KEY
TMDB_API_KEY=${TMDB_API_KEY:-}

# Invite code
echo ""
read -p "Invite code for new signups (press Enter for open registration): " INVITE_CODE
INVITE_CODE=${INVITE_CODE:-}

# Generate passwords
echo ""
echo "Generating secure passwords and secrets..."
DB_PASSWORD=$(generate_secret)
REDIS_PASSWORD=$(generate_secret)
JWT_SECRET=$(generate_secret)
ENCRYPTION_KEY=$(generate_secret)

# Write .env
cat > .env << EOF
DOMAIN=${DOMAIN}
DB_HOST=postgres
DB_PORT=5432
DB_NAME=streamvault
DB_USER=streamvault
DB_PASSWORD=${DB_PASSWORD}
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
INVITE_CODE=${INVITE_CODE}
TMDB_API_KEY=${TMDB_API_KEY}
EOF

echo ""
echo "  .env file created with generated secrets."
echo ""

# Confirm before building
echo "============================================"
echo "  Ready to build and start StreamVault"
echo "============================================"
echo ""
echo "  Domain:        ${DOMAIN}"
echo "  TMDB:          ${TMDB_API_KEY:-not set}"
echo "  Invite Code:   ${INVITE_CODE:-disabled (open registration)}"
echo ""
read -p "Start the build? (y/n): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted. Your .env file has been saved — run 'docker compose up --build -d' when ready."
  exit 0
fi

echo ""
echo "Building and starting containers... (this may take a few minutes)"
echo ""

docker compose up --build -d

echo ""
echo "============================================"
echo "  StreamVault is running!"
echo "============================================"
echo ""
if [[ "$DOMAIN" == "localhost" ]]; then
  echo "  Open: http://localhost"
else
  echo "  Open: https://${DOMAIN}"
  echo "  (Make sure DNS for ${DOMAIN} points to this server)"
fi
echo ""
echo "  Manage:"
echo "    docker compose logs -f        # view logs"
echo "    docker compose down            # stop"
echo "    docker compose up -d           # start"
echo "    docker compose up --build -d   # rebuild"
echo ""
