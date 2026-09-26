#!/usr/bin/env bash
# Loads .env into the shell environment, then starts the Spring Boot app.
# (Java/Spring Boot has no built-in .env loader; this mirrors the Node app's `dotenv` usage at the shell level.)
set -a
# shellcheck disable=SC1091
source "$(dirname "$0")/.env"
set +a

# Free the app's port if a previous run is still holding it (e.g. a stale background process).
PORT="${PORT:-8080}"
EXISTING_PID=$(lsof -ti:"$PORT" 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
  echo "Port $PORT is in use by PID $EXISTING_PID — stopping it before starting..."
  kill "$EXISTING_PID" 2>/dev/null
  sleep 1
  # Force-kill if it's still around after a graceful attempt.
  if lsof -ti:"$PORT" >/dev/null 2>&1; then
    kill -9 "$EXISTING_PID" 2>/dev/null
    sleep 1
  fi
fi

exec "$(dirname "$0")/mvnw" -f "$(dirname "$0")/pom.xml" spring-boot:run
