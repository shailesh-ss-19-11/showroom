#!/usr/bin/env bash
# Loads .env into the shell environment, then starts the Spring Boot app.
# (Java/Spring Boot has no built-in .env loader; this mirrors the Node app's `dotenv` usage at the shell level.)
set -a
# shellcheck disable=SC1091
source "$(dirname "$0")/.env"
set +a
exec "$(dirname "$0")/mvnw" -f "$(dirname "$0")/pom.xml" spring-boot:run
