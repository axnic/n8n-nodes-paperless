---
name: git-commit
description: Use when the user wants to commit, stage, or finalize work in the n8n-nodes-paperless repository — creating a commit message, splitting staged changes into atomic commits, or checking a message against the project's commitlint rules.
---

# Git commit convention

Commits follow [gitsym](https://github.com/axnic/gitsym): the type is one ASCII symbol. The normative
text is `docs/specification.md` in that repository; the rules enforced here are `.commitlintrc.js`
(which extends `@axnic/commitlint-config-gitsym`).

## Why we commit this way

A commit is a historical record. Future readers (human or AI) use `git log` and `git blame` to
understand _why_ a line looks the way it does, so the message carries intent instead of restating the
diff. Prefer small, atomic commits (one logical change each) over one large commit: review,
bisection and revert are all cheaper.

## Commit format

```text
type[scope]: Subject starting with uppercase

Body providing context and intent, max 80 chars per line

Co-Authored-By: <model name> <noreply@anthropic.com>
Signed-off-by: <Name> <email>
```

The scope is optional (`type: Subject` is valid). A breaking type (`+!`, `~!`, `-!`) requires a
`BREAKING CHANGE: <what breaks and what to do>` paragraph in the body, before the trailers.

## Types

The type is one of these (case-sensitive, ASCII). `#` is never a type: git treats it as a comment.

| Symbol         | Name       | Use for                                   |
| -------------- | ---------- | ----------------------------------------- |
| `+`            | Add        | New operation, resource, option, file     |
| `-`            | Remove     | Delete code, file, dead feature           |
| `~`            | Improve    | Behavior or config improvement (non-bug) |
| `!`            | Fix        | Repair a bug or broken behavior           |
| `=`            | Refactor   | No behavior change (style, tests, DX, CI) |
| `^`            | Bump       | Dependency version upgrade or downgrade   |
| `>`            | Move       | Rename or relocate resources              |
| `<`            | Revert     | Undo a previous commit                    |
| `@`            | Docs       | README, comments                          |
| `$`            | Security   | Fix, policy, secret management            |
| `?`            | Experiment | POC, investigation                        |
| `*`            | Wildcard   | Fits no other type; never a default       |
| `+!` `~!` `-!` | Breaking   | Only Add, Improve, Remove can break       |

Disambiguation:

- **`~` vs `!`** — did the previous behavior have a bug? Yes: `!`. No, it was correct and became
  better: `~`.
- **`=` vs `~`** — is the change observable by an n8n workflow author (parameters, operations,
  output shape, credential fields)? Observable: `~`. Invisible (refactor, tests, CI tweak): `=`.
- **`^`** is for every dependency version change, by hand or by Renovate. A bump that forces
  breaking changes in the node (an `n8n-workflow` major that changes parameters or output) is `~!`
  with a `BREAKING CHANGE:` paragraph, never `^`.
- There is no `ci` or `build` type: use the type that describes what changed, with the `ci` or
  `mise` scope.
- Changing the parameters or the output shape of an existing operation breaks existing workflows:
  type it `~!` (or `-!` when removing).

## Scopes

Optional, bracketed, lower-case, comma-separated without spaces (`type[a,b]:`), at most 3. When
present, the scope must be in the `scope-enum` of `.commitlintrc.js`:

| Scope         | Covers                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| `n8n-node`    | The node itself: `nodes/` (resources, operations, router, transport, node.json) |
| `document`    | The document and document-note resources (`nodes/Paperless/v2/actions/document*`) |
| `credentials` | `credentials/`                                                                  |
| `nodejs`      | Node/pnpm/TypeScript tooling: `package.json`, `tsconfig.json`, ESLint, n8n-node |
| `mise`        | `mise.toml`                                                                     |
| `rtunk`       | `.rtunk/`                                                                       |
| `ci`          | `.github/workflows/`, `docker-compose.test.yml`, `tests/e2e/`                   |
| `deps`        | Dependency updates (npm, actions, Docker images)                                |
| `readme`      | `README.md`                                                                     |
| `repo`        | Other root config, `.agents/`, `.github/`, `LICENSE`, ignores, editor/dev config |

Decision tree: which files did the change touch?

1. Files map to exactly one scope: use it. Other resources (tag, task, ...) go under `n8n-node`;
   `document` is for the document and document-note resources.
2. One atomic change touching several areas: list them (max 3), e.g. `[n8n-node,ci]`.
3. No identifiable area, or too many: omit the scope rather than invent one.
4. Ambiguous: ask the user, never guess. More than 3 areas and not atomic: split the commit.

## Subject

Imperative ("Add", not "Added"), uppercase first letter, no trailing period, one space after the
colon, whole header at most 100 characters.

## Body

Optional for trivial changes (a one-line bump, a typo), mandatory otherwise. It explains **why**,
never **what** (the diff shows it): motivation, trade-offs, user impact.

- Max 80 characters per line; the first character is uppercase (`body-case`).
- Avoid lines starting with `#` (git comments).
- The "why" comes from the user's own words. Never infer it from the diff; ask if it was not said.

## Trailers, signature and sign-off

Every commit is signed and signed off; the history of this repository shows the pattern:

```sh
git commit -S -s -m "$(cat <<'EOF'
...message...
EOF
)"
```

- `-S` signs with the key configured in git. Never pass another key (`-S<keyid>`), never override
  `user.*` or `user.signingkey`. If signing fails, stop and tell the user: no `--no-gpg-sign`, no
  `--no-verify`. The repository ruleset requires signed commits.
- `-s` adds `Signed-off-by:` (DCO) with the git identity; do not also write it by hand.
- AI-assisted commits carry `Co-Authored-By: <model name> <noreply@anthropic.com>` (for example
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`), using the model powering the
  session. Human-only commits carry none.
- Trailers go after a blank line, after `BREAKING CHANGE:` when there is one.

## Commitlint rules (mirror of `.commitlintrc.js` and the gitsym config)

Keep this section in sync when `.commitlintrc.js` or the gitsym package changes: read both, update
the matching rows, then run `mise run ci:commitlint -- --last`.

| Rule                     | Value                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `type-enum`              | `+ - ~ ! = ^ > < @ $ ? *`, `+!` `~!` `-!`                                                         |
| `scope-enum`             | `n8n-node`, `document`, `credentials`, `nodejs`, `mise`, `rtunk`, `ci`, `deps`, `readme`, `repo` |
| `scope-case`             | lower-case                                                                                        |
| `gitsym-scope-format`    | comma-separated, no spaces, no empty item                                                         |
| `gitsym-scope-max-count` | at most 3                                                                                         |
| `gitsym-header-spacing`  | exactly one space after the colon                                                                 |
| `gitsym-breaking-body`   | `+!`/`~!`/`-!` needs a `BREAKING CHANGE: <text>` line                                             |
| `header-max-length`      | 100; no full stop; no leading/trailing whitespace                                                 |
| `subject-case`           | sentence-case; not empty; no full stop                                                            |
| `body-max-line-length`   | 80                                                                                                |
| `body-case`              | sentence-case                                                                                     |
| `footer-leading-blank`   | blank line before the footer                                                                      |
| `footer-max-line-length` | 80                                                                                                |

### Checking a message

```sh
mise run ci:commitlint -- --last                     # the last commit
mise run ci:commitlint -- --from <sha> --to <sha>    # a range
printf '%s\n' "<message>" | mise exec npm:@commitlint/cli@latest -- commitlint   # a draft
```

`ci:commitlint` needs a range or `--last`: without one commitlint waits on stdin. The `commitlint`
rtunk action also checks the message at commit time (`.rtunk/rtunk.yaml`).

### If commitlint fails

| Rule                               | Likely cause                                      | Fix                                          |
| ---------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| `type-enum`                        | Misspelled symbol, or `!!`/`^!`-style combo       | Use a listed symbol or `+!`/`~!`/`-!`        |
| `scope-enum`                       | Scope not in the list (`n8n`, `docs`, `e2e`)      | Pick from the Scopes table, or omit it       |
| `scope-case`                       | Upper-case scope                                  | Lower-case it                                |
| `gitsym-scope-format`              | `[a, b]` or `[a,,b]`                              | `[a,b]`                                      |
| `gitsym-breaking-body`             | Breaking type without the paragraph               | Add `BREAKING CHANGE: ...`                   |
| `header-max-length`                | Header over 100                                   | Trim, move detail to the body                |
| `subject-case` / `subject-full-stop` | Lower-case start or trailing period             | Uppercase first letter, drop the period      |
| `body-max-line-length`             | Body line over 80                                 | Rewrap                                       |
| `body-case`                        | Body starts with a lowercase word (`n8n`, `pnpm`) | Rephrase so the first character is uppercase |
| `footer-leading-blank`             | No blank line before the trailers                 | Add one                                      |

## Workflow

1. Survey: `git status`, `git diff --cached --name-only`, `git diff --name-only`,
   `git log --oneline --no-merges -10`.
2. Unrelated staged changes: split into atomic commits instead of forcing a multi-scope header.
3. Pick the type, then the scope (decision tree above).
4. Draft the subject, then the body (ask the user for the "why" if it was not stated).
5. Stage the files, then commit with the heredoc form above (`-S -s`).
6. Check it: `mise run ci:commitlint -- --last`.

## Examples

**Good — new operation:**

```text
+[document]: Add a split operation

Users who scan batches into one PDF had to split them outside n8n before
uploading. The operation calls the Paperless-ngx split endpoint so the
whole flow stays in one workflow.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Signed-off-by: Alexandre NICOLAIE <xunleii@users.noreply.github.com>
```

**Good — fix with a root cause:**

```text
![ci]: Quote the Paperless-ngx version in the 2.20 e2e workflow

An unquoted `version: 2.20` is parsed by YAML as the float 2.2, so the CI
tested Paperless-ngx 2.2 instead of 2.20.
```

**Good — bump, no body needed:**

```text
^[deps]: Bump n8n-workflow to 2.17.0
```

**Good — breaking change:**

```text
~![n8n-node]: Return the created tag directly instead of under results

The create operations wrapped their object in a one-item list, which made
workflows index into `results[0]` for no reason.

BREAKING CHANGE: workflows reading `{{ $json.results[0] }}` after Tag >
Create must read `{{ $json }}` instead.
```

**Bad — no type, restates the diff:** `Updated router.ts to add a case`

**Bad — scope outside the list:** `+[docs]: Add a section` fails `scope-enum`; use `@[readme]:`.

**Bad — breaking type without the paragraph:** `-![n8n-node]: Remove the ASN operation` fails
`gitsym-breaking-body`.

**Bad — invalid type:** `!![n8n-node]: Fix and change everything`: only `+`, `~`, `-` take the `!`
suffix.

**Bad — lower-case subject, spaced scope list:** `+[n8n-node, ci]: add a thing` fails
`gitsym-scope-format` and `subject-case`.

## References

- [gitsym specification](https://github.com/axnic/gitsym/blob/main/docs/specification.md)
- [Conventions of the axnic organization](https://github.com/axnic/.github/blob/main/docs/Conventions.md)
