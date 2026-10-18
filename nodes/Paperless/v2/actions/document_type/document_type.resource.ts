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
			show: { resource: ['document_type'] },
		},
		noDataExpression: true,
		options: [
			{
				name: 'Create a Document Type',
				value: 'create',
				action: 'Create a new document type',
				description: 'Create a new document type',
			},
			{
				name: 'Delete a Document Type',
				value: 'remove',
				action: 'Delete a document type',
			},
			{
				name: 'Get a Document Type',
				value: 'get',
				action: 'Get a document type',
			},
			{
				name: 'List Document Types',
				value: 'list',
				action: 'List all document types',
				description: 'List all document types',
			},
			{
				name: 'Update a Document Type',
				value: 'update',
				action: 'Update a document type',
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
