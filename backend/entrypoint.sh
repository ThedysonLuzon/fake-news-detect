#!/usr/bin/env bash
set -e

# If you provide the SA key as base64 in env, write it to a file.
if [[ -n "${GCP_SA_KEY_B64}" ]]; then
  mkdir -p /secrets
  echo "$GCP_SA_KEY_B64" | base64 -d > /secrets/gcp-sa.json
  export GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcp-sa.json
fi

# Run the API
cd /app/backend
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8080}"
