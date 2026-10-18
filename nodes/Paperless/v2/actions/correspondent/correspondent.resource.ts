import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as remove from './remove.operation';
import * as update from './update.operation';

export { create, get, list, remove, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		default: 'list',
		displayOptions: {
			show: { resource: ['correspondent'] },
		},
		noDataExpression: true,
		options: [
			{
				name: 'Create a Correspondent',
				value: 'create',
				action: 'Create a new correspondent',
				description: 'Create a new correspondent',
			},
			{
				name: 'Delete a Correspondent',
				value: 'remove',
				action: 'Delete a correspondent',
			},
			{
				name: 'Get a Correspondent',
				value: 'get',
				action: 'Get a correspondent',
			},
			{
				name: 'List Correspondents',
				value: 'list',
				action: 'List all correspondents',
				description: 'List all correspondents',
			},
			{
				name: 'Update a Correspondent',
				value: 'update',
				action: 'Update a correspondent',
			},
		],
		type: 'options',
	},
	...create.description,
	...get.description,
	...list.description,
	...remove.description,
	...update.description,
];
