#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${1:-$SCRIPT_DIR/.env}"
OUT_DIR="$SCRIPT_DIR/.rendered"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

collect_vars() {
  if command -v rg >/dev/null 2>&1; then
    rg --no-filename -o '\$\{[A-Z0-9_]+\}' "$@" | tr -d '${}' | sort -u
  else
    grep -hoE '\$\{[A-Z0-9_]+\}' "$@" | tr -d '${}' | sort -u
  fi
}

require_vars() {
  local missing=0
  while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    if [[ -z "${!name:-}" ]]; then
      echo "Missing required variable: $name" >&2
      missing=1
    fi
  done < <(collect_vars "$SCRIPT_DIR/lds.yaml" "$SCRIPT_DIR/cds.yaml")

  if [[ "$missing" -ne 0 ]]; then
    exit 1
  fi
}

render_file() {
  local in_file="$1"
  local out_file="$2"
  perl -pe 's/\$\{([A-Z0-9_]+)\}/defined $ENV{$1} ? $ENV{$1} : die "Missing env var: $1\n"/ge' "$in_file" > "$out_file"
}

require_vars
mkdir -p "$OUT_DIR"
render_file "$SCRIPT_DIR/lds.yaml" "$OUT_DIR/lds.yaml"
render_file "$SCRIPT_DIR/cds.yaml" "$OUT_DIR/cds.yaml"

echo "Rendered:"
echo "  $OUT_DIR/lds.yaml"
echo "  $OUT_DIR/cds.yaml"
