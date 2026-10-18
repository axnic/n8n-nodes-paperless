# Issue examples

Illustrative: they are built from real repository facts (the supported Paperless-ngx versions in
`mise.toml`, the `ci:e2e` workflow, the operations table of the README) and are shape references,
not records. Replace them with real issues as they appear
(`gh issue list -R axnic/n8n-nodes-paperless`).

## Bug: evidenced, with a reproduction

Title: `Document > Create fails with a 400 when the correspondent id does not exist`

Issue Type `Bug`, label `type::bug`, `priority::medium`.

```markdown
## Context

Document > Create with the additional field Correspondent set to an id that Paperless-ngx does not
know ends the execution with `Request failed with status code 400` and no hint of which field is
wrong. The upload itself is accepted by the API only when every referenced object exists.

Node version: 0.x (package.json), n8n 2.16, Paperless-ngx 3.3.2.

## Proposal

Reproduction:

1. Add a Paperless-ngx node, Resource Document, Operation Create, a binary property, Correspondent `9999`.
2. Run it.
3. Observed: a 400 with the raw API body. Expected: an error naming the Correspondent field, or at
   least the API validation message in the node error description.

## Acceptance criteria

- [ ] The node error of the repro includes the API validation message
- [ ] An e2e test covers the unknown-correspondent case (`mise run ci:e2e 3.3.2` passes)

## Notes

Check the oldest tested version (`mise run ci:e2e 2.20`): the validation message may differ.
```

## Feature: a missing operation

Title: `Add a Bulk edit operation to the Document resource`

Issue Type `Feature`, label `type::feature`, `priority::low`.

```markdown
## Context

The Document resource covers upload, read, update and delete one document at a time (README,
Operations). Applying a tag to many documents takes one Update per item, while Paperless-ngx exposes
a bulk edit endpoint (https://docs.paperless-ngx.com/api/).

## Proposal

One operation, Document > Bulk edit, taking a list of document ids and a method (add tag, remove tag,
set correspondent, ...), returning the API response under `results` like the other operations.

## Acceptance criteria

- [ ] The operation is listed in the node and in the README operations table
- [ ] An e2e test applies a tag to two documents on every version of `mise run ci:e2e:versions`
- [ ] A version that lacks the endpoint is documented in the README compatibility section

## Notes

Not part of the README rewrite; filed because someone is about to work on it.
```

## Task: follow-up deferred from a PR

Title: `Drop Paperless-ngx 2.20 from the tested versions once 3.4 is released`

Issue Type `Task`, label `type::chore`, `priority::low`.

```markdown
## Context

`mise run ci:e2e:versions` lists five Paperless-ngx versions, oldest first, and each has its own
caller workflow created by e2e.sync. The README promises a window "from 2.20 to 3.3"; a new release
extends the list and the oldest one eventually stops being worth the CI minutes.

## Proposal

When 3.4 ships: add it to `ci:e2e:versions`, let e2e.sync create its workflow, and decide with the
maintainer whether 2.20 is dropped (remove it from the task, delete its caller, update the README
table).

## Acceptance criteria

- [ ] `mise run ci:e2e:versions` lists 3.4 and the README table matches it
- [ ] No workflow file remains for a version that is no longer listed

## Notes

Blocked until 3.4 is released (`status::blocked` once someone picks it up).
```

## Bad: what to avoid

Title: `+[docs]: Improve docs` with a 200-line body.

- Commit format in the title; the outcome is unreadable.
- No Issue Type or `type::*` label.
- Body repeats the title, lists an empty risk table, "alternatives considered" with one entry, and
  a step-by-step implementation plan that belongs in the PR.
- Filed for something already done in an open PR (no duplicate check).
