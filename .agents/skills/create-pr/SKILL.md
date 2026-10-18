---
name: create-pr
description: Use when the user wants to open, create or submit a pull request for the current work in the n8n-nodes-paperless-ngx repository ("open a PR", "push this and create the PR", "make a pull request"). Runs the pre-flight (context, commit validation, `mise run ci`), pushes the branch, writes a PR title that is a valid gitsym commit header (the merge commit keeps it) and a body that does not trip commitlint's footer-trailer parsing, creates it with `gh`, then arms a Monitor on the PR (comments, reviews, CI, merge). The repository ruleset requires a pull request, so this is the only way work lands on `main`.
---

# Create a pull request

The ruleset of `main` requires a pull request and signed commits, and the repository only allows
**merge commits** (squash and rebase are disabled). The merge commit title is the PR title and its
message is the PR body (`merge_commit_title: PR_TITLE`, `merge_commit_message: PR_BODY`). The repo is
`axnic/n8n-nodes-paperless-ngx`; always pass `-R axnic/n8n-nodes-paperless-ngx` to `gh` instead of relying on
the working directory. Merging is the user's call, never done here unless explicitly asked.

## 1. Pre-flight

1. Snapshot (branch, push status, existing PR, commits, files, uncommitted changes), and use it for
   the whole draft instead of re-running `git log`/`git diff`:

   ```bash
   bash .agents/skills/create-pr/scripts/gather-context.sh        # base defaults to origin/main
   ```

2. Never push to or open a PR from `main`. If the commits sit on local `main`, push them to a new
   branch (`git push origin main:refs/heads/<branch>`) and leave local `main` for the user to realign.
   Uncommitted changes: stop, commits are made by the `git-commit` skill, not here.
3. Validate the commits (`mise run ci:commitlint -- --from <base> --to HEAD`, signatures,
   `Signed-off-by:`, `Co-Authored-By:`):

   ```bash
   bash .agents/skills/create-pr/scripts/validate_commits.sh
   ```

   `FAIL` blocks the PR (fix the commit, see `.agents/skills/git-commit/SKILL.md`). `WARN` is
   surfaced to the user as is.

4. Run the local gate and read the result:

   ```bash
   mise run ci             # ESLint (n8n community-package rules), then tsc build + icons
   mise run lint           # rtunk: markdownlint, prettier, yamllint, trufflehog, git-diff-check
   mise run ci:e2e <version>   # needs Docker; only when the change touches an operation, the transport or tests/e2e
   ```

   `mise run ci:e2e:versions` lists the Paperless-ngx versions CI covers. For a change that depends on
   a Paperless-ngx API difference, run the oldest and the newest. Tick a box in the PR body only for
   a command that actually ran and passed.

5. Style reference: `references/pr-examples.md`; recent merged PRs:
   `gh pr list -R axnic/n8n-nodes-paperless-ngx --state merged -L 5`.

## 2. Branch and push

Branch names are `<area>/<short-kebab-description>` (`ci/quote-e2e-version`, `readme/rewrite`,
`feat/document-split`). Never `--force`; if the branch already exists on the remote with other
commits, ask the user.

```bash
git push -u origin HEAD
```

## 3. Title

The merge commit takes the PR title as its subject, and the QA workflow lints the last commit of
`main` on push, so the title is a valid commit header, `type[scope]: Subject`, checked against
`.commitlintrc.js`:

- `type`: one of `+ - ~ ! = ^ > < @ $ ? *`, breaking variants `+! ~! -!` only.
- `scope`: optional, lower-case, from the `scope-enum` of `.commitlintrc.js` (`n8n-node`, `document`,
  `credentials`, `nodejs`, `mise`, `rtunk`, `ci`, `deps`, `readme`, `repo`); several are
  comma-separated, no space, at most 3 (`n8n-node,ci`).
- `Subject`: sentence case, no trailing period, header at most 100 characters.
- One commit: reuse its header. Several: one header that sums them up, with the type of the
  dominant change.

Re-read `.commitlintrc.js` rather than trusting this list if it looks stale.

## 4. Body

There is no PR template in this repository; use these sections (keep the headings):

```markdown
## What this changes and why

## Related

## How this was tested
- [ ] `mise run ci`
- [ ] `mise run lint`
- [ ] `mise run ci:e2e <version>` (versions: `mise run ci:e2e:versions`)

## Checklist
- [ ] Commits are signed and follow gitsym
- [ ] README updated if an operation, a parameter or the supported versions changed
```

- Why before what: the motivation, then the behavior change for workflow authors, then known limits.
- `Related`: the issue, with `Closes #N` when the PR fully resolves it.
- `How this was tested`: `[x]` only for what ran and passed; `[ ]` otherwise (drop the e2e line when
  it does not apply, and say why). Add manual steps (commands and observed output) when the change
  is not covered, for example a run in a live n8n with `tilt up`.
- A change to an operation's parameters or output shape breaks existing workflows: say so, and make
  sure the commit type is breaking (`~!`/`-!`).
- Checklist: leave unchecked what is not true.
- **Footer-trailer pitfall.** The body becomes the merge commit's message, and commitlint on `main`
  parses any line shaped `word: text` near the end as a git trailer (`footer-leading-blank`,
  `footer-max-line-length` of 80). Never start a line with `word:` (`Note:`, `Known limit:`,
  `Fixes:`); put the label in bold or inside a sentence, and keep lines that wrap prose from
  starting with `word:`.
- End the body with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- Check the file before creating: `grep -nE '^[A-Za-z-]+:( |$)' <body-file>` must print nothing
  (`Closes #N` has no colon and passes).

Write the body to a file in the session scratchpad, never inline in the shell.

```bash
gh pr create -R axnic/n8n-nodes-paperless-ngx --base main --head <branch> \
  --title "<header>" --body-file <scratchpad>/pr.md
```

The command prints the PR URL; the number is its last path segment. Labels are optional: use only
existing ones (`type::*`, `status::*`, `priority::*`, see `gh label list -R axnic/n8n-nodes-paperless-ngx`);
do not create labels.

## 5. Monitor

Right after the PR is created, arm the watcher with the `Monitor` tool:

```js
Monitor({
  command: "bash .agents/skills/create-pr/scripts/monitor-pr.sh <pr-number> 60",
  description: "PR #<pr-number>: comments, reviews, CI, merge",
  persistent: true,
});
```

`monitor-pr.sh` polls every 60 s, prints one line per event, and exits when the PR leaves `OPEN`:

- `[comment] <user>: <body>`: top-level conversation comment (the AI Review workflow, PR-Agent,
  answers here too).
- `[review comment] <user> on <path>:<line>: <body>`: inline diff comment.
- `[review <STATE>] <user>: <body>`: submitted review (`APPROVED`, `CHANGES_REQUESTED`, or a
  `COMMENTED` review with a body).
- `[check] <name>: pass|fail|cancel|skipping`: each finished CI check, reported once. The checks
  are `Quality Assurance`, `Code Scanning`, `OSV-Scanner` and one `E2E (<version>)` per tested
  Paperless-ngx version.
- `[state] PR #<n> is now MERGED|CLOSED`: terminal; the script exits.

### Reacting to events

- `comment`, `review comment`, `review CHANGES_REQUESTED`: read the full thread with `gh`, verify the
  claim against the code before changing anything, and tell the user. Do not reply or resolve on the
  user's behalf unless asked.
- `check <name>: fail`: read the log with
  `gh run view <run-id> -R axnic/n8n-nodes-paperless-ngx --log-failed`, find the cause and tell the user.
  An `E2E (<version>)` failure on a single version often is a Paperless-ngx API difference: reproduce
  it locally with `mise run ci:e2e <version>`. Fix only what belongs to this PR's changes.
- `review APPROVED` or a plain `COMMENTED` with no ask: note it to the user, no action.
- `MERGED`: report it, then offer to `git switch main && git pull` and delete the local and remote
  branch (deletion needs confirmation). `CLOSED`: report it and ask whether to keep the branch.

### Follow-up commits

After pushing a new commit to a branch with an open PR: re-run steps 1.3 and 1.4, then ask the user
whether the PR body (and title) needs updating. Show the proposed diff of the body before applying
it with `gh pr edit`; never rewrite it silently.

## Rules

- Title is a valid gitsym commit header; body has the sections above and no `word:` lines.
- No force-push, no merge, no label creation, no PR from `main`.
- Branch names `<area>/<kebab>`; commits signed (`-S`) and signed off (`-s`), with
  `Co-Authored-By:` when an AI helped.
- Do not wrap body prose to 80 columns: the limit applies to commit messages, but keep a line from
  starting with `word:`.
