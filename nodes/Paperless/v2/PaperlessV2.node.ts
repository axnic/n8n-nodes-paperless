import type {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeTypeBaseDescription,
	INodeExecutionData,
} from 'n8n-workflow';

import { router } from './actions/router';
import * as version from './actions/version';
import { listSearch } from './methods';

// The icon comes from the description built in the constructor (versioned node).
// eslint-disable-next-line @n8n/community-nodes/icon-validation
export class PaperlessV2 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			...version.description,
			icon: 'file:../../icons/paperless-ngx.svg',
			usableAsTool: true,
		};
	}

	methods = {
		listSearch,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await router.call(this);
	}
}
