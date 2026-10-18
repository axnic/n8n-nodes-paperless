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
			show: { resource: ['tag'] },
		},
		noDataExpression: true,
		options: [
			{
				name: 'Create a Tag',
				value: 'create',
				action: 'Create a new tag',
				description: 'Create a new tag',
			},
			{
				name: 'Delete a Tag',
				value: 'remove',
				action: 'Delete a tag',
			},
			{
				name: 'Get a Tag',
				value: 'get',
				action: 'Get a tag',
			},
			{
				name: 'List Tags',
				value: 'list',
				action: 'List all tags',
				description: 'List all tags',
			},
			{
				name: 'Update a Tag',
				value: 'update',
				action: 'Update a tag',
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
