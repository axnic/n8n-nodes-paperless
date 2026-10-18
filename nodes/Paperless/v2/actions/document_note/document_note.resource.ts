import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as list from './list.operation';
import * as remove from './remove.operation';

export { create, list, remove };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		default: 'list',
		displayOptions: {
			show: { resource: ['document_note'] },
		},
		noDataExpression: true,
		options: [
			{
				name: 'Create a Document Note',
				value: 'create',
				action: 'Create a new document note',
				description: 'Create a new document note',
			},
			{
				name: 'Delete a Document Note',
				value: 'remove',
				action: 'Delete a document note',
			},
			{
				name: 'List Document Notes',
				value: 'list',
				action: 'List all document notes',
				description: 'List all document notes',
			},
		],
		type: 'options',
	},
	...create.description,
	...list.description,
	...remove.description,
];
