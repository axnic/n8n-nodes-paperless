# PR examples

Illustrative: the merged PRs of `axnic/n8n-nodes-paperless` predate the gitsym convention (#11 to #18
use gitmoji or Conventional Commits titles). These examples are built from the repository's recent
gitsym commits and are shape references, not records. Replace them with real PRs as they appear
(`gh pr list -R axnic/n8n-nodes-paperless --state merged`). Titles are commit headers because the
merge commit keeps them.

## Small fix with a real root cause

Title: `![ci]: Quote the Paperless-ngx version in the 2.20 e2e workflow` (branch `ci/quote-e2e-version`)

Why it is a good model:

- `What this changes and why` opens with the failure (YAML parsed `version: 2.20` as the float 2.2,
  so CI tested Paperless-ngx 2.2 and the E2E (2.20) job failed), then the change (quote the value).
- `Related` points at the failing run.
- `How this was tested` shows the observable proof, not just a ticked box.

```markdown
## What this changes and why

An unquoted `version: 2.20` is parsed by YAML as the float 2.2, so the E2E (2.20) job pulled
Paperless-ngx 2.2 and failed. Quoting the value keeps it a string.

## Related

Failing run of E2E (2.20) on `main`.

## How this was tested

- [x] `mise run lint` (yamllint)
- [x] The E2E (2.20) check of this PR runs against Paperless-ngx 2.20 (see the `docker compose` log)
```

## Task change with a compatibility rationale

Title: `~[mise]: Take the e2e version as an argument of ci:e2e`

Why it is a good model:

- Bold lead-ins (`**Fallback.**`, `**Failure mode.**`) structure a longer body without extra
  headings, and none of them is a `word:` line.
- Every non-obvious decision has its reason next to it (`E2E_VERSION` stays as the fallback because
  the central `e2e.run` workflow passes the version that way).
- `How this was tested` ticks the commands that ran (`mise run ci:e2e 3.3.2`, then without an
  argument to show the missing-argument error).

## Node change that affects workflow authors

Title: `+[document]: Add a split operation`

What a good body adds:

- The operation, its parameters and its output shape under `results`, in a sentence each.
- The Paperless-ngx versions that have the endpoint; an older version either skipped in the e2e
  suite or documented in the README compatibility section.
- `How this was tested`: `mise run ci`, `mise run ci:e2e <oldest>` and `<newest>`, and the README
  operations table updated (unchecked box in the Checklist if not).

## Docs-only pass

Title: `@[readme]: Document n8n, Node and Paperless-ngx compatibility`

Why it is a good model:

- States up front that no node code is touched, then one bullet per section with what was wrong and
  what it says now.
- Names how it was verified (versions read from `package.json` and `ci:e2e:versions`).

## Title cheat sheet

| Bad                                   | Why                                  | Good                                                   |
| ------------------------------------- | ------------------------------------ | ------------------------------------------------------ |
| `Add split operation`                 | no type, commitlint fails            | `+[document]: Add a split operation`                   |
| `+[Document]: Add a split operation`  | scope must be lower-case             | `+[document]: Add a split operation`                   |
| `+[document]: add a split operation.` | subject case and trailing period     | `+[document]: Add a split operation`                   |
| `feat(document): Add split`           | Conventional Commits, not gitsym     | `+[document]: Add a split operation`                   |
| `:sparkles:(n8n-node): Add split`     | gitmoji, the old history style       | `+[n8n-node]: Add a split operation`                   |
| `+[docs]: Add a section`              | `docs` is not in the `scope-enum`    | `@[readme]: Add a section`                             |
| `![ci]: Fix`                          | says nothing                         | `![ci]: Quote the Paperless-ngx version in the 2.20 e2e workflow` |
