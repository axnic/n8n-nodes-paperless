# n8n-nodes-paperless

<!-- markdownlint-disable MD033 MD034 -->
<img
  src="https://raw.githubusercontent.com/axnic/n8n-nodes-paperless/refs/heads/main/nodes/Paperless/v2/paperless-ngx.svg"
  alt="Paperless-ngx"
  height="64"
>
<!-- markdownlint-enable MD033 MD034 -->

[![QA](https://img.shields.io/github/actions/workflow/status/axnic/n8n-nodes-paperless/merge_group%2Cpull_request%2Cpush.qa.yaml?branch=main&label=QA)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.qa.yaml)
[![license](https://img.shields.io/github/license/axnic/n8n-nodes-paperless?label=license)](LICENSE.md)
[![commits](https://img.shields.io/badge/commits-gitsym-blue)](https://github.com/axnic/gitsym)

An [n8n](https://n8n.io) community node for [Paperless-ngx](https://docs.paperless-ngx.com/): upload documents,
search them, tag and annotate them from your workflows, without writing a single HTTP request.

- **Documents**: upload a file, list and read documents, update their title, tags, correspondent or custom
  fields, read their metadata and history, download the preview, create share links, add notes.
- **Everything around them**: tags, correspondents, document types, custom fields, archive serial numbers
  and the status of consumption tasks.
- **Tested for real**: every operation runs in CI against five Paperless-ngx releases, from 2.20 to 3.3
  ([compatibility](#compatibility)).

## Installation

In n8n, go to **Settings > Community Nodes > Install** and enter the package name:

```text
@n8n-chezmoi-sh/n8n-nodes-paperless
```

See the [community nodes guide](https://docs.n8n.io/integrations/community-nodes/installation/) for the details,
including self-hosted instances installing it from the command line.

> [!NOTE]
> Uploading a document needs the `form-data` package, which n8n installs along with the node if it is missing.

## Getting started

1. In Paperless-ngx, open **My Profile** and generate an **API Auth Token**.
2. In n8n, create a **Paperless-ngx API** credential with:
   - the API URL of your instance, ending with `/api` (for example `https://paperless.example.com/api`);
   - the token from the first step.
3. Add a **Paperless-ngx** node to a workflow and pick a resource and an operation.

For example, to file the attachments of incoming emails: an email trigger, then **Document > Create** reading the
attachment from its binary property, with a title and a correspondent as additional fields. The node returns the id of the
consumption task, and **Task > Get** tells you when Paperless-ngx has finished with it.

## Operations

| Resource | Operations |
| --- | --- |
| Document | Create (upload), Get, List, Update, Delete, Get history, Get metadata, Get metadata suggestions, Get preview, Get share links |
| Document note | Create, List, Delete |
| Tag | Create, Get, List, Update, Delete |
| Correspondent | Create, Get, List, Update, Delete |
| Document type | Create, Get, List, Update, Delete |
| Custom field | Create, Get, List, Update, Delete |
| Task | Get |
| ASN | Get next ASN |

Every operation returns its data under `results`, so the next node reads `{{ $json.results[0] }}` for a single
object and `{{ $json.results }}` for a list.

## Use as an AI tool

The node is flagged `usableAsTool`, so it can be connected as a tool to the n8n **AI Agent** node. Through the
**MCP Server Trigger** node, it is also exposed to any MCP client (Claude Desktop, Claude Code, Cursor...). One tool
covers every resource and operation: they are fixed in the node, and the model only fills the other parameters.

For a community node, n8n needs `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` on the instance.

- To let the model fill a parameter, set the field to an expression such as
  `{{ $fromAI('title', 'Title of the document', 'string') }}`, or use **Let the model define this parameter** in the
  field's menu.
- The `ID` fields default to **From List**, which a model cannot use. Switch them to **By ID** and give an expression,
  e.g. `{{ $fromAI('id', 'ID of the document', 'number') }}`.
- Operations that need or return binary data (**Document > Create**, **Document > Get preview**) make no sense for a
  model: use them in regular workflows.

For example, asked to "find the invoices from ACME of 2025", an agent uses **Document > List**, and
**Tag** and **Correspondent** get/list to resolve the ids it filters on.

## Compatibility

Built against `n8n-workflow` 2.16, for n8n 2.x. It needs Node.js 22 or later.

Every operation of the node is tested against a real Paperless-ngx (create, read, update, list and delete,
document upload and its metadata, notes, tasks), one CI workflow per version, so each badge reflects that
version alone. Other versions are not tested; older ones may work.

| Paperless-ngx version | Status |
| --- | --- |
| 2.20 | [![E2E (Paperless-ngx 2.20)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-2.20.yaml/badge.svg?branch=main)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-2.20.yaml) |
| 3.0.5 | [![E2E (Paperless-ngx 3.0.5)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-3.0.5.yaml/badge.svg?branch=main)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-3.0.5.yaml) |
| 3.1.3 | [![E2E (Paperless-ngx 3.1.3)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-3.1.3.yaml/badge.svg?branch=main)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-3.1.3.yaml) |
| 3.2.1 | [![E2E (Paperless-ngx 3.2.1)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-3.2.1.yaml/badge.svg?branch=main)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-3.2.1.yaml) |
| 3.3.2 | [![E2E (Paperless-ngx 3.3.2)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-3.3.2.yaml/badge.svg?branch=main)](https://github.com/axnic/n8n-nodes-paperless/actions/workflows/merge_group%2Cpull_request%2Cpush.e2e-3.3.2.yaml) |

## Contributing

You need [mise](https://mise.jdx.dev) and, for the end-to-end tests, Docker.

```sh
mise install                # Node, pnpm and rtunk
mise run ci                 # lint, then build
mise run lint               # every linter, through rtunk
mise run ci:e2e 3.3.2       # the end-to-end tests against a throwaway Paperless-ngx 3.3.2
```

`mise run ci:e2e` starts Paperless-ngx and Redis from [docker-compose.test.yml](docker-compose.test.yml), runs
[the tests](tests/e2e), then removes everything. The version is the Paperless-ngx image tag, so any release can be
tried the same way. To add one to CI, add it to the `ci:e2e:versions` task of [mise.toml](mise.toml).

Commits follow [gitsym](https://github.com/axnic/gitsym), for example `+[document]: Add a split operation`.

To try the node in a live n8n next to a Paperless-ngx, `tilt up` starts both with hot reload (see the
[Tiltfile](Tiltfile)).

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Paperless-ngx documentation](https://docs.paperless-ngx.com/)
- [Paperless-ngx REST API](https://docs.paperless-ngx.com/api/)

## License

[MIT](LICENSE.md)
