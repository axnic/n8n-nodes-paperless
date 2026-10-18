#!/usr/bin/env bash
# validate_commits.sh - pre-PR commit check (read-only).
# 1. commit convention via the repo's commitlint task over <base>..HEAD
# 2. signature present on every commit
# 3. Signed-off-by (DCO) on every commit (FAIL) and Co-Authored-By trailer (WARN only:
#    human-only commits legitimately lack it)
#
# Usage: validate_commits.sh [base-ref]   (default: origin/main, else main)
# Exit 0 = no FAIL, 1 = at least one FAIL.

set -euo pipefail

base=${1:-}
if [[ -z ${base} ]]; then
  if git rev-parse --verify --quiet origin/main >/dev/null; then base=origin/main; else base=main; fi
fi
failed=0

shas=$(git rev-list --no-merges --reverse "${base}..HEAD")
if [[ -z ${shas} ]]; then
  echo "OK   no commits between ${base} and HEAD"
  exit 0
fi

# 1. commitlint (mise task ci:commitlint)
task=ci:commitlint
# log.showSignature=true prepends signature text to the messages commitlint reads and breaks it.
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=log.showSignature GIT_CONFIG_VALUE_0=false
if mise run "${task}" -- --from "${base}" --to HEAD; then
  echo "OK   commitlint (${task})"
else
  echo "FAIL commitlint (${task}) - fix the commit messages (git-commit skill)"
  failed=1
fi

# 2 + 3. per-commit signature and trailer
while IFS= read -r sha; do
  short=$(git rev-parse --short "${sha}")
  sig=$(git log -1 --no-show-signature --format='%G?' "${sha}" 2>/dev/null || echo N)
  case ${sig} in
    G | U) echo "OK   [${short}] signed" ;;
    E) echo "WARN [${short}] signature cannot be checked here (missing key); verify manually" ;;
    *)
      echo "FAIL [${short}] not signed or bad signature (${sig}) - re-sign with the key configured in git (the AI never uses another key or --no-gpg-sign)"
      failed=1
      ;;
  esac
  if git log -1 --no-show-signature --format=%B "${sha}" | grep -q '^Signed-off-by: '; then
    echo "OK   [${short}] Signed-off-by"
  else
    echo "FAIL [${short}] no Signed-off-by trailer - amend with git commit -s (DCO)"
    failed=1
  fi
  if git log -1 --no-show-signature --format=%B "${sha}" | grep -q '^Co-Authored-By: '; then
    echo "OK   [${short}] Co-Authored-By trailer"
  else
    echo "WARN [${short}] no Co-Authored-By trailer (required only if an AI assistant helped)"
  fi
done <<<"${shas}"

if [[ ${failed} -eq 0 ]]; then echo "All blocking checks passed"; else echo "Blocking failures: fix before opening the PR"; fi
exit "${failed}"
