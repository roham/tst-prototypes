#!/usr/bin/env bash
# TST Build Daemon — Wrapper Script
# Deploys to: /opt/tst-daemon/ on kaaos-daemon VM
#
# Usage:
#   ./tst-build.sh              # single cycle (for cron)
#   ./tst-build.sh --marathon   # infinite loop (for nohup)

set -euo pipefail

DAEMON_DIR="/opt/tst-daemon"
PROMPT="$DAEMON_DIR/build-prompt.md"
REPO="$HOME/tst-prototypes"
LOCKFILE="$DAEMON_DIR/tst-build.lock"
LOGDIR="$DAEMON_DIR/logs"
CYCLE_TIMEOUT=2400     # 40 min max per cycle
SLEEP_BETWEEN=120      # 2 min between cycles

mkdir -p "$LOGDIR"

# --- Lock ---
if [ -f "$LOCKFILE" ]; then
    LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCKFILE" 2>/dev/null || stat -f %m "$LOCKFILE" 2>/dev/null) ))
    if [ "$LOCK_AGE" -gt 3600 ]; then
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) WARN: stale lock (${LOCK_AGE}s), removing" >> "$LOGDIR/tst-build.log"
        rm -f "$LOCKFILE"
    else
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) SKIP: daemon locked (${LOCK_AGE}s old)" >> "$LOGDIR/tst-build.log"
        exit 0
    fi
fi
echo $$ > "$LOCKFILE"
trap 'rm -f "$LOCKFILE"' EXIT

# --- Single Cycle ---
run_cycle() {
    local CYCLE_LOG="$LOGDIR/cycle-$(date -u +%Y%m%d-%H%M).log"

    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) START cycle" >> "$LOGDIR/tst-build.log"

    # Pull latest code
    cd "$REPO"
    git pull --rebase --quiet 2>/dev/null || true

    # Run Claude — timeout wraps claude, not cat
    cat "$PROMPT" | timeout "$CYCLE_TIMEOUT" claude \
        -p \
        --dangerously-skip-permissions \
        --model opus \
        --max-turns 120 \
        --max-budget-usd 30.00 \
        > "$CYCLE_LOG" 2>&1 || {
            echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ERROR: cycle failed (exit $?)" >> "$LOGDIR/tst-build.log"
            return 1
        }

    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) DONE cycle — log: $CYCLE_LOG" >> "$LOGDIR/tst-build.log"
}

# --- Marathon Mode ---
if [ "${1:-}" = "--marathon" ]; then
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) MARATHON mode started (PID $$)" >> "$LOGDIR/tst-build.log"
    while true; do
        run_cycle || true
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) sleeping ${SLEEP_BETWEEN}s" >> "$LOGDIR/tst-build.log"
        sleep "$SLEEP_BETWEEN"
    done
else
    run_cycle
fi
