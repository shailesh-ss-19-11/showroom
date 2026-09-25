#!/usr/bin/env bash
# One-time bootstrap for the local Garage (S3-compatible) cluster used to store bike photos.
# Run this once after `docker compose up -d garage`, on a fresh volume.
set -euo pipefail

CONTAINER="showroom-garage"
BUCKET="bike-photos"
KEY_NAME="bike-photos-key"

echo "Waiting for Garage to be healthy..."
until docker exec "$CONTAINER" /garage status >/dev/null 2>&1; do
  sleep 1
done

NODE_ID=$(docker exec "$CONTAINER" /garage node id -q | cut -d'@' -f1)
echo "Node ID: $NODE_ID"

if docker exec "$CONTAINER" /garage layout show | grep -q "NO ROLE ASSIGNED"; then
  docker exec "$CONTAINER" /garage layout assign -z dc1 -c 1G "$NODE_ID"
  docker exec "$CONTAINER" /garage layout apply --version 1
else
  echo "Layout already assigned, skipping."
fi

if ! docker exec "$CONTAINER" /garage bucket list | grep -q "$BUCKET"; then
  docker exec "$CONTAINER" /garage bucket create "$BUCKET"
else
  echo "Bucket $BUCKET already exists, skipping."
fi

if ! docker exec "$CONTAINER" /garage key list | grep -q "$KEY_NAME"; then
  docker exec "$CONTAINER" /garage key create "$KEY_NAME"
  docker exec "$CONTAINER" /garage bucket allow --read --write --owner "$BUCKET" --key "$KEY_NAME"
  echo ""
  echo "Copy the Key ID / Secret key printed above into server/.env as"
  echo "GARAGE_ACCESS_KEY_ID / GARAGE_SECRET_ACCESS_KEY."
else
  echo "Key $KEY_NAME already exists — fetch its info with:"
  echo "  docker exec $CONTAINER /garage key info $KEY_NAME --show-secret"
fi
