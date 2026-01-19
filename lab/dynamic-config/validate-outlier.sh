#!/usr/bin/env bash
set -euo pipefail

LISTENER_HOST="${LISTENER_HOST:-127.0.0.1}"
LISTENER_PORT="${LISTENER_PORT:-10000}"
ADMIN_HOST="${ADMIN_HOST:-127.0.0.1}"
ADMIN_PORT="${ADMIN_PORT:-9901}"
PATH_PREFIX="${PATH_PREFIX:-/headers}"
REQUESTS="${REQUESTS:-500}"
SLEEP_BETWEEN="${SLEEP_BETWEEN:-0.1}"
CLUSTER_NAME="${CLUSTER_NAME:-instance_1}"
TRIGGER_CIRCUIT_BREAKER="${TRIGGER_CIRCUIT_BREAKER:-true}"
CB_REQUESTS="${CB_REQUESTS:-200}"
CB_CONCURRENCY="${CB_CONCURRENCY:-50}"

listener_url="http://${LISTENER_HOST}:${LISTENER_PORT}${PATH_PREFIX}"
admin_stats_url="http://${ADMIN_HOST}:${ADMIN_PORT}/stats?filter=cluster\\.${CLUSTER_NAME}\\.outlier_detection"
admin_cb_stats_url="http://${ADMIN_HOST}:${ADMIN_PORT}/stats?filter=cluster\\.${CLUSTER_NAME}\\.(circuit_breakers|upstream_rq_pending_overflow|upstream_cx_overflow|upstream_rq_retry_overflow|upstream_rq_timeout)"

echo "Hitting listener: ${listener_url}"
for _ in $(seq 1 "${REQUESTS}"); do
  printf "\rProgress: %s/%s" "${_}" "${REQUESTS}"
  curl -sS -o /dev/null -w " %{http_code}\n" "${listener_url}" || true
  sleep "${SLEEP_BETWEEN}"
done
echo

if [[ "${TRIGGER_CIRCUIT_BREAKER}" == "true" ]]; then
  echo
  echo "Triggering circuit breaker with ${CB_REQUESTS} requests at concurrency ${CB_CONCURRENCY}"
  for _ in $(seq 1 "${CB_REQUESTS}"); do
    curl -sS -o /dev/null -w " %{http_code}\n" "${listener_url}" &
    if (( _ % CB_CONCURRENCY == 0 )); then
      wait
    fi
  done
  wait
  echo
  echo "Circuit breaker stats:"
  curl -sS "${admin_cb_stats_url}" || true
fi

echo
echo "Outlier detection stats:"
curl -sS "${admin_stats_url}" || true
