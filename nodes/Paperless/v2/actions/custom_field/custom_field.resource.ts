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
			show: { resource: ['custom_field'] },
		},
		noDataExpression: true,
		options: [
			{
				name: 'Create a Custom Field',
				value: 'create',
				action: 'Create a new custom field',
				description: 'Create a new custom field',
			},
			{
				name: 'Delete a Custom Field',
				value: 'remove',
				action: 'Delete a custom field',
			},
			{
				name: 'Get a Custom Field',
				value: 'get',
				action: 'Get a custom field',
			},
			{
				name: 'List Custom Fields',
				value: 'list',
				action: 'List all custom fields',
				description: 'List all custom fields',
			},
			{
				name: 'Update a Custom Field',
				value: 'update',
				action: 'Update a custom field',
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
