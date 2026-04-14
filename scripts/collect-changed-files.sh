#!/usr/bin/env bash

set -euo pipefail

BASE_REF="${1:-}"
HEAD_REF="${2:-HEAD}"

if [[ -z "${BASE_REF}" || "${BASE_REF}" =~ ^0+$ ]]; then
  if git rev-parse --verify HEAD^ >/dev/null 2>&1; then
    BASE_REF="$(git rev-parse HEAD^)"
  else
    git ls-files
    exit 0
  fi
fi

git diff --name-only --diff-filter=ACMR "${BASE_REF}" "${HEAD_REF}"
