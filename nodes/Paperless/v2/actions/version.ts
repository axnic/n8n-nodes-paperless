/* eslint-disable n8n-nodes-base/node-filename-against-convention */
// Disabled because this file defines the version-specific implementation of the node
import { INodeTypeDescription, NodeConnectionTypes } from 'n8n-workflow';

import * as asn from './asn/asn.resource';
import * as correspondent from './correspondent/correspondent.resource';
import * as custom_field from './custom_field/custom_field.resource';
import * as document from './document/document.resource';
import * as document_note from './document_note/document_note.resource';
import * as document_type from './document_type/document_type.resource';
import * as tag from './tag/tag.resource';
import * as task from './task/task.resource';

export const description: INodeTypeDescription = {
	displayName: 'Paperless-ngx',
	name: 'paperless',
	icon: 'file:../../icons/paperless-ngx.svg',
	group: ['input'],
	version: 2,
	subtitle: '={{ $parameter.operation + ": " + $parameter.resource }}',
	description: 'Search, read and manage the documents, tags, correspondents, document types, custom fields, notes and tasks of a Paperless-ngx instance',
	defaults: { name: 'Paperless-ngx' },

	credentials: [{ name: 'paperlessApi', required: true }],
	inputs: [NodeConnectionTypes.Main],
	outputs: [NodeConnectionTypes.Main],

	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			default: 'document',
			noDataExpression: true,
			options: [
				{
					name: 'ASN',
					value: 'asn',
					description: 'Archive Serial Number',
				},
				{
					name: 'Correspondent',
					value: 'correspondent',
					description: 'Person or organization behind documents',
				},
				{
					name: 'Custom Field',
					value: 'custom_field',
					description: 'User-defined additional informative fields',
				},
				{
					name: 'Document',
					value: 'document',
					description: 'Scanned document or file saved in Paperless',
				},
				{
					name: 'Document Note',
					value: 'document_note',
					description: 'Additional information about a document',
				},
				{
					name: 'Document Type',
					value: 'document_type',
					description: 'Kind of a document',
				},
				{
					name: 'Tag',
					value: 'tag',
					description: 'Label for documents',
				},
				{
					name: 'Task',
					value: 'task',
					description: 'Work to be done on a document',
				},
			],
			type: 'options',
		},
		...asn.description,
		...correspondent.description,
		...custom_field.description,
		...document.description,
		...document_note.description,
		...document_type.description,
		...tag.description,
		...task.description,
	],
};
