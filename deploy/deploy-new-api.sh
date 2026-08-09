#!/usr/bin/env bash

set -Eeuo pipefail

readonly DEPLOY_DIR='/opt/new-api'
readonly COMPOSE_FILE="$DEPLOY_DIR/compose.yaml"
readonly ENV_FILE="$DEPLOY_DIR/.env"
readonly DATABASE_FILE="$DEPLOY_DIR/data/one-api.db"
readonly BACKUP_DIR="$DEPLOY_DIR/backups"
readonly LOCK_FILE='/var/lock/new-api-deploy.lock'

image_ref="${1:-}"
if [[ ! "$image_ref" =~ ^ghcr\.io/imxv/new-api@sha256:[0-9a-f]{64}$ ]]; then
  echo 'The image must be an immutable ghcr.io/imxv/new-api digest.' >&2
  exit 2
fi

ghcr_user="${2:-}"
if [[ ! "$ghcr_user" =~ ^[A-Za-z0-9-]+$ ]]; then
  echo 'A valid GHCR user is required.' >&2
  exit 2
fi

if ! IFS= read -r ghcr_token || [[ -z "$ghcr_token" ]]; then
  echo 'A short-lived GHCR token is required on standard input.' >&2
  exit 2
fi

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo 'Another new-api deployment is already running.' >&2
  exit 3
fi

if [[ ! -f "$COMPOSE_FILE" || ! -f "$ENV_FILE" ]]; then
  echo "Missing deployment files in $DEPLOY_DIR." >&2
  exit 4
fi

mkdir -p "$BACKUP_DIR"
timestamp="$(date -u +'%Y%m%dT%H%M%SZ')"
old_image="$(docker inspect new-api --format '{{.Config.Image}}' 2>/dev/null || true)"

logged_in=false
logout_ghcr() {
  if [[ "$logged_in" == true ]]; then
    docker logout ghcr.io >/dev/null 2>&1 || true
  fi
}
trap logout_ghcr EXIT

printf '%s' "$ghcr_token" | docker login ghcr.io --username "$ghcr_user" --password-stdin >/dev/null
logged_in=true
unset ghcr_token

if [[ -f "$DATABASE_FILE" ]]; then
  backup_file="$BACKUP_DIR/one-api.db.$timestamp"
  python3 - "$DATABASE_FILE" "$backup_file" <<'PY'
import sqlite3
import sys

source = sqlite3.connect(sys.argv[1])
destination = sqlite3.connect(sys.argv[2])
with destination:
    source.backup(destination)
destination.close()
source.close()
PY
  echo "Database backup created: $backup_file"
fi

docker pull "$image_ref"

set_image() {
  local next_image="$1"
  python3 - "$ENV_FILE" "$next_image" <<'PY'
from pathlib import Path
import os
import sys
import tempfile

path = Path(sys.argv[1])
image = sys.argv[2]
lines = path.read_text().splitlines()
updated = False
result = []
for line in lines:
    if line.startswith('NEW_API_IMAGE='):
        result.append(f'NEW_API_IMAGE={image}')
        updated = True
    else:
        result.append(line)
if not updated:
    result.append(f'NEW_API_IMAGE={image}')

fd, temporary_path = tempfile.mkstemp(dir=path.parent, prefix='.env.', text=True)
try:
    with os.fdopen(fd, 'w') as temporary:
        temporary.write('\n'.join(result) + '\n')
    os.chmod(temporary_path, path.stat().st_mode)
    os.replace(temporary_path, path)
finally:
    if os.path.exists(temporary_path):
        os.unlink(temporary_path)
PY
}

start_image() {
  local next_image="$1"
  set_image "$next_image"
  docker compose \
    --project-directory "$DEPLOY_DIR" \
    -f "$COMPOSE_FILE" \
    up -d --no-deps new-api
}

wait_until_healthy() {
  local attempts=45
  for ((attempt = 1; attempt <= attempts; attempt++)); do
    status="$(docker inspect new-api --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' 2>/dev/null || true)"
    if [[ "$status" == 'healthy' ]]; then
      return 0
    fi
    sleep 2
  done
  return 1
}

if start_image "$image_ref" && wait_until_healthy; then
  echo "Deployment succeeded: $image_ref"
  exit 0
fi

echo "Deployment failed health checks: $image_ref" >&2
docker logs --tail 100 new-api >&2 || true

if [[ -n "$old_image" ]]; then
  echo "Rolling back to: $old_image" >&2
  if start_image "$old_image" && wait_until_healthy; then
    echo "Rollback succeeded: $old_image" >&2
  else
    echo "Rollback did not become healthy." >&2
  fi
fi

exit 1
