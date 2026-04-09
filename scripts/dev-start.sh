#!/usr/bin/env bash
# Start API in background, then Vite. From repo root: bash scripts/dev-start.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
(
  cd "$ROOT/backend"
  exec python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
) &
UV_PID=$!
trap 'kill "$UV_PID" 2>/dev/null || true' EXIT INT TERM
cd "$ROOT"
npm run dev
