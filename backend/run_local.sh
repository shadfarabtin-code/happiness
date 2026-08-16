#!/usr/bin/env bash
# Runs the backend locally against the real Firestore database ("happiness-db"),
# the same one production uses. Requires Application Default Credentials:
#   gcloud auth application-default login
set -euo pipefail
cd "$(dirname "$0")"
source venv/bin/activate
uvicorn main:app --reload --port 8000
