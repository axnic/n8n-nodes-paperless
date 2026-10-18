import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as get from './get.operation';
import * as get_history from './get_history.operation';
import * as get_metadata from './get_metadata.operation';
import * as get_metadata_suggestions from './get_metadata_suggestions.operation';
import * as get_preview from './get_preview.operation';
import * as get_sharelink from './get_sharelink.operation';
import * as list from './list.operation';
import * as remove from './remove.operation';
import * as update from './update.operation';

export {
	create,
	get,
	get_history,
	get_metadata,
	get_metadata_suggestions,
	get_preview,
	get_sharelink,
	list,
	remove,
	update,
};

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		default: 'list',
		displayOptions: {
			show: { resource: ['document'] },
		},
		noDataExpression: true,
		options: [
			{
				name: 'Create a Document',
				value: 'create',
				action: 'Create a new document',
				description: 'Create a new document',
			},
			{
				name: 'Delete a Document',
				value: 'remove',
				action: 'Delete a document',
			},
			{
				name: 'Get a Document',
				value: 'get',
				action: 'Get a document',
			},
			{
				name: 'Get some Metadata Suggestions',
				value: 'get_metadata_suggestions',
				action: 'Get some metadata suggestions for a document',
				description: 'Get some metadata suggestions for a document',
			},
			{
				name: 'Get the Document History',
				value: 'get_history',
				action: 'Get the list of changes made to a document',
				description: 'Get the list of changes made to a document',
			},
			{
				name: 'Get the Document Metadata',
				value: 'get_metadata',
				action: 'Get the metadata of the document',
				description: 'Get the metadata of the document',
			},
			{
				name: 'Get the Document Preview',
				value: 'get_preview',
				action: 'Get a preview of the document',
				description: 'Get a preview of the document',
			},
			{
				name: 'Get the Document Share Link',
				value: 'get_sharelink',
				action: 'Get the share link of the document',
				description: 'Get the share link of the document',
			},
			{
				name: 'List Documents',
				value: 'list',
				action: 'List all documents',
				description: 'List all documents',
			},
			{
				name: 'Update a Document',
				value: 'update',
				action: 'Update a document',
			},
		],
		type: 'options',
	},
	...create.description,
	...get.description,
	...get_history.description,
	...get_metadata.description,
	...get_metadata_suggestions.description,
	...get_preview.description,
	...get_sharelink.description,
	...list.description,
	...remove.description,
	...update.description,
];
