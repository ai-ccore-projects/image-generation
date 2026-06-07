#!/usr/bin/env bash
set -euo pipefail

# Production deploy for the AI image-generation app.
# Next.js 15 app, npm toolchain, served behind the `dev` reverse-proxy at /image-generation.
# Mirrors Ethics-build-game/deploy.sh, adapted for npm.

APP_NAME="image-generation"
APP_DIR="/home/vishva/Projects/image-generation"
PORT=4187
SLUG="image-generation"
DEV_GATEWAY_PORT=4186
ECOSYSTEM="$APP_DIR/ecosystem.config.cjs"

# Serve under the /image-generation sub-path (Next.js basePath). Baked into the
# build below AND set at runtime via ecosystem.config.cjs — the two MUST match.
export NEXT_PUBLIC_BASE_PATH="/$SLUG"

cd "$APP_DIR"

# Only install deps when explicitly asked (e.g. first deploy or lockfile change).
if [[ "${1:-}" == "--install" ]]; then
  echo "==> Installing dependencies (npm ci)..."
  npm ci --legacy-peer-deps
fi

echo "==> Building..."
rm -rf .next && npm run build

# Guard: refuse to ship a dev build.
if [ -d ".next/static/development" ]; then
  echo "==> ERROR: .next contains a development build. Aborting."
  exit 1
fi

echo "==> (Re)starting PM2 process ($APP_NAME)..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start "$ECOSYSTEM"
fi

echo "==> Waiting for process to come online..."
sleep 3

STATUS=$(pm2 jlist 2>/dev/null | node -e "
  const procs = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const p = procs.find(p => p.name === '$APP_NAME');
  console.log(p ? p.pm2_env.status : 'not_found');
")

if [ "$STATUS" = "online" ]; then
  echo "==> $APP_NAME is online on port $PORT"
  pm2 save
else
  echo "==> WARNING: process status is '$STATUS' — check logs with: pm2 logs $APP_NAME"
  exit 1
fi

echo "==> Done. Direct: http://localhost:$PORT   Proxied: http://localhost:$DEV_GATEWAY_PORT/$SLUG"
