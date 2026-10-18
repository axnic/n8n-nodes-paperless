---
name: create-issue
description: Use when work in the n8n-nodes-paperless repository surfaces something that should be tracked as a GitHub issue ("this deserves its own issue", "we should do X later", "file a bug for this", "open an issue", "track this follow-up"): a bug found in passing, a follow-up that does not fit the current PR, a missing operation or parameter, a Paperless-ngx or n8n compatibility problem, an upstream blocker. Runs the duplicate check with `gh`, sets a sentence-form title, the Issue Type (Bug, Feature, Task), the `type::*` and optional `priority::*` labels, and a Context / Proposal / Acceptance criteria / Notes body. Never for security vulnerabilities.
---

# Create an issue

Repo: `axnic/n8n-nodes-paperless`; always pass `-R axnic/n8n-nodes-paperless` to `gh`. Issues are for
work and information the codebase does not already carry.

## 0. Never file these publicly

A suspected vulnerability (in the node, the credential handling, or a dependency): do not open an
issue, PR or discussion. The repository has no `SECURITY.md` and private vulnerability reporting is
not enabled, so stop and hand it to the user to report privately. Hardening work that discloses
nothing exploitable (a pinned action, a permission trimmed) is a normal `type::security` issue.

Questions about how to use the node ("how do I list tags?") are not issues to file from here; they
belong to the user to answer or label `question`.

## 1. When to file

All three must hold:

1. **Not in scope for the current change.** If it fits the current PR without growing it, do it
   there.
2. **Specific enough to act on.** "Improve error handling" is not an issue; "Document > Create
   returns an opaque 400 when the correspondent id does not exist" is.
3. **Carries information the repo does not.** A symptom, a decision rationale, a changed
   constraint. Restating `git log` is noise.

Good triggers: a bug seen while doing something else; a follow-up from a PR that cannot ship in it;
a Paperless-ngx endpoint the node does not cover yet; a new Paperless-ngx or n8n release that
breaks or changes something; an upstream blocker to link back to.

Do not file: refactor ideas with no concrete trigger; "X is broken, I'll look later" without
evidence; questions the code answers.

## 2. Duplicate check

```bash
gh issue list -R axnic/n8n-nodes-paperless --state all --search "<symptom or feature keywords>" -L 10
gh pr list    -R axnic/n8n-nodes-paperless --state all --search "<keywords>" -L 5
```

Related issue found: comment on it, or file a distinct one and cross-link. Fixed already by a merged
PR: do not file. The Renovate "Dependency Dashboard" issue tracks dependency updates: do not file
those separately.

## 3. Templates

The repository has no issue templates (`.github/ISSUE_TEMPLATE/` does not exist), so the body
skeleton below is the structure. For a bug, put these facts in `Context`:

- node version (`package.json`) and n8n version;
- Paperless-ngx version (Settings > System status, or the `ci:e2e` image tag);
- resource and operation, with the relevant parameters (no tokens or URLs of a private instance);
- observed versus expected, with the verbatim error from the n8n execution.

Read `.github/` again before filing if templates may have been added.

## 4. Title

Sentence form, read in an issue list one at a time. The commit format `type[scope]: Subject` is for
commits and PR titles only; do not use it here.

- Verb first for proposed work ("Add ...", "Document ..."); the symptom first for a bug ("Document >
  Create fails when ...").
- Sentence case, no trailing period, at most 100 characters.
- Says what changes for a user when it closes. Read it without the body: if the outcome is unclear,
  rewrite it.

| Bad                          | Better                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| `+[document]: Add split`     | `Add a split operation to the Document resource`                |
| `Fix upload`                 | `Document > Create fails with a 400 on Paperless-ngx 2.20`      |
| `Improve the credentials`    | `Validate that the API URL of the credential ends with /api`    |
| `Docs`                       | `Document the supported Paperless-ngx versions for each release` |

## 5. Issue Type and labels

Set exactly one Issue Type (`gh issue create --type`; the repo has `Bug`, `Feature`, `Task`), one
`type::*` label, and a `priority::*` label only when the priority is obvious from the evidence.
Labels are the ones the repository has (`gh label list -R axnic/n8n-nodes-paperless`); do not create
labels.

| Intent                                          | Issue Type | `type::*` label  |
| ----------------------------------------------- | ---------- | ---------------- |
| Something behaves wrongly                       | `Bug`      | `type::bug`      |
| New operation, parameter, option or resource    | `Feature`  | `type::feature`  |
| Documentation only (README, node descriptions)  | `Task`     | `type::docs`     |
| Tooling, CI, refactor, dependency, maintenance  | `Task`     | `type::chore`    |
| Security hardening (not a vulnerability report) | `Task`     | `type::security` |

Ambiguous pairs:

| Pair                | Ask                                                           | Resolution                                                                |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `Feature` vs `Task` | Could users already do this, just by a worse mechanism?       | Yes: `Task` (only the implementation changes). No: `Feature`.             |
| `Docs` vs `Task`    | Does closing it change anything besides a document?           | No: `type::docs`. Yes: `type::chore`/`bug`, with the doc as a side effect. |
| `Bug` vs `Feature`  | Did the node or the README ever promise this behavior?        | Yes and it fails: `Bug`. No: `Feature`.                                   |

The legacy labels `bug`, `enhancement`, `documentation` and `question` also exist. Add one only
when it adds information (`question` for an unanswered usage question); the `type::*` label is the
one that counts. Do not add `status::*` labels at filing time (`status::in-progress|needs-review|blocked`
describe work in flight).

`priority::*` quick guide: `high` when an operation users rely on is broken now, or the CI/publish
path is broken; `medium` for a real, recurring annoyance or a needed enhancement; `low` for
nice-to-have with no stated reason. Unsure: omit.

## 6. Body

Four sections, in this order; drop one only if it truly does not apply. Prose is not wrapped at 80
columns (that limit is for commit messages).

```markdown
## Context

What exists today, what is broken or missing, with evidence: verbatim error text, the resource and
operation, node, n8n and Paperless-ngx versions, links to runs and PRs. Facts only.

## Proposal

For work: what to do, with options only when the choice is genuinely open (pick one and say why
otherwise). For a bug: exact steps, observed versus expected.

## Acceptance criteria

- [ ] Observable outcomes checkable by running a command or reading a file/CI result

## Notes

Cross-links (issues, PRs, upstream Paperless-ngx or n8n issues). Optional.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

- Acceptance criteria are checkable: "`mise run ci:e2e 3.3.2` passes with a test for the new
  operation" passes, "works better" fails.
- No implementation step lists, no empty risk or alternatives tables, no restating the title.
- A focused 25-line body with two links beats a 200-line one that fills every field.
- Evidence must be real: run the command and paste the output; do not reconstruct from memory.

## 7. Create

Write the body to a file in the session scratchpad and use `--body-file`; never inline in the shell.

```bash
gh issue create -R axnic/n8n-nodes-paperless \
  --title "<sentence-form title>" \
  --body-file <scratchpad>/issue.md \
  --type Bug \
  --label "type::bug"
```

`--type` needs a recent `gh`; if it is rejected, create without it and set the type with
`gh issue edit <n> -R axnic/n8n-nodes-paperless --type Bug`, and if that fails too, say so in the
report rather than skipping silently. The command prints the URL; the number is its last path
segment.

## 8. Cross-link

- Deferred from a PR or another issue: mention `#N` in both directions (a comment on the PR is
  enough: `gh pr comment`).
- Part of a larger piece of work: reference the parent in Notes.
- A PR that fully resolves it says `Closes #N` in its `Related` section (see `create-pr`).

## Rules summary

- Duplicate check first; one Issue Type + one `type::*` label; existing labels only.
- Sentence-form title, no commit symbols; body Context / Proposal / Acceptance criteria / Notes.
- Vulnerabilities are never filed publicly.
- Filing is the whole action: do not start the fix from here.

Examples: `references/issue-examples.md`.
