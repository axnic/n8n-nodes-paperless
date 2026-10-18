#!/usr/bin/env bash
# monitor-pr.sh - PR watcher for the Monitor tool (read-only).
# One stdout line per event: new comment, review comment, review, CI check
# result; exits once the PR leaves OPEN.
#
# Usage: monitor-pr.sh <pr-number> [poll-seconds]   (default 60)
# Env:   REPO=<owner/repo> to override `gh repo view`.

set -euo pipefail

pr=${1:?usage: monitor-pr.sh <pr-number> [poll-seconds]}
poll=${2:-60}
repo=${REPO:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}
since=$(date -u +%Y-%m-%dT%H:%M:%SZ)
prev=""
trim='gsub("\n";" ") | .[0:300]'

while true; do
  # Taken before the calls so an event landing mid-iteration is caught next loop.
  start=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  gh api "repos/${repo}/issues/${pr}/comments?since=${since}" --jq \
    ".[] | \"[comment] \(.user.login): \(.body | ${trim})\"" || true
  gh api "repos/${repo}/pulls/${pr}/comments?since=${since}" --jq \
    ".[] | \"[review comment] \(.user.login) on \(.path):\(.line // .original_line): \(.body | ${trim})\"" || true
  # No `since` on this endpoint: filter client-side.
  gh api "repos/${repo}/pulls/${pr}/reviews" | jq -r --arg s "${since}" \
    ".[] | select(.submitted_at > \$s and (.body != \"\" or .state != \"COMMENTED\")) | \"[review \(.state)] \(.user.login): \(.body | ${trim})\"" || true

  # Report each finished check once (comm needs sorted input).
  cur=$(gh pr checks "${pr}" -R "${repo}" --json name,bucket \
    --jq '.[] | select(.bucket != "pending") | "[check] \(.name): \(.bucket)"' 2>/dev/null | sort || true)
  comm -13 <(printf '%s\n' "${prev}") <(printf '%s\n' "${cur}") | grep -v '^$' || true
  prev=${cur}

  # A transient failure (network, 5xx, rate limit) must not end a watch meant to run until the PR leaves OPEN.
  state=$(gh pr view "${pr}" -R "${repo}" --json state --jq .state) || { sleep "${poll}"; continue; }
  if [[ ${state} != "OPEN" ]]; then
    echo "[state] PR #${pr} is now ${state}"
    exit 0
  fi

  since=${start}
  sleep "${poll}"
done
