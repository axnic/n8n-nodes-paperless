import { VersionedNodeType, INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { PaperlessV2 } from './v2/PaperlessV2.node';

export class Paperless extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'Paperless-ngx',
			name: 'paperless',
			defaultVersion: 2,
			description: 'Search, read and manage the documents, tags, correspondents, document types, custom fields, notes and tasks of a Paperless-ngx instance',
			group: ['input'],
			icon: 'file:../../icons/paperless-ngx.svg',
			usableAsTool: true, // exposed to AI agents and MCP: see "Use as an AI tool" in the README
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			2: new PaperlessV2(baseDescription),
		};

		super(nodeVersions, baseDescription);
	}
}
