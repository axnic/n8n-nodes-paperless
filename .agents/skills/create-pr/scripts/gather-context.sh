#!/usr/bin/env bash
# gather-context.sh - pre-PR context snapshot (read-only).
# Prints branch, push status, any existing PR, commits since base, files
# changed and uncommitted files, so the PR draft comes from one snapshot.
#
# Usage: gather-context.sh [base-ref]   (default: origin/main, else main)

set -euo pipefail

base=${1:-}
if [[ -z ${base} ]]; then
  if git rev-parse --verify --quiet origin/main >/dev/null; then base=origin/main; else base=main; fi
fi
branch=$(git branch --show-current)

echo "== Branch"
echo "branch : ${branch:-(detached HEAD)}"
echo "base   : ${base}"
if [[ ${branch} == "main" ]]; then
  echo "WARNING: on main - never open a PR from main (push to a new branch instead)"
fi

echo "== Push status"
if upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
  ahead=$(git rev-list --count "${upstream}..HEAD")
  behind=$(git rev-list --count "HEAD..${upstream}")
  echo "upstream: ${upstream} (ahead ${ahead}, behind ${behind})"
else
  echo "upstream: none - run: git push -u origin HEAD"
fi

echo "== Existing PR for this branch"
if [[ -n ${branch} ]]; then
  gh pr list --head "${branch}" --state all --json number,state,title,url \
    --jq '.[] | "#\(.number) [\(.state)] \(.title) \(.url)"' 2>/dev/null || echo "(gh unavailable)"
fi

echo "== Commits since ${base}"
git --no-pager log --no-show-signature --format='%h %s' "${base}..HEAD"

echo "== Files changed"
git --no-pager diff --no-ext-diff --stat "${base}...HEAD"

echo "== Uncommitted / untracked"
git status --short | grep -v '^$' || echo "(none)"
