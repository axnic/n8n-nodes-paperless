import { VersionedNodeType, INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { PaperlessV2 } from './v2/PaperlessV2.node';

export class Paperless extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'Paperless-ngx',
			name: 'paperless',
			defaultVersion: 2,
			description: 'Consume documents and metadata from Paperless-ngx API',
			group: ['input'],
			icon: 'file:../../icons/paperless-ngx.svg',
			usableAsTool: true, // WARN: This enables AI Tools agent integration but is not officially supported by n8n. See: https://github.com/n8n-io/n8n/issues/12593
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			2: new PaperlessV2(baseDescription),
		};

		super(nodeVersions, baseDescription);
	}
}
