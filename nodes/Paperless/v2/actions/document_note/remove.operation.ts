import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameterResourceLocator,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Document ID',
		name: 'id',
		default: { mode: 'list', value: '' },
		description: 'ID of the document associated with the note',
		displayOptions: {
			show: {
				resource: ['document_note'],
				operation: ['remove'],
			},
		},
		hint: 'The ID of the document associated with the note',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				placeholder: `Select a Document...`,
				type: 'list',
				typeOptions: {
					searchListMethod: 'documentSearch',
					searchFilterRequired: false,
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				placeholder: `Enter Document ID...`,
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[1-9][0-9]*$',
							errorMessage: 'The ID must be a positive integer',
						},
					},
				],
			},
			{
				displayName: 'By URL',
				name: 'url',
				placeholder: `Enter Document URL...`,
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^(?:http|https)://(?:.+?)/documents/(\\d+)/details$',
							errorMessage:
								'The URL must be a valid Paperless document URL (e.g. https://paperless.example.com/documents/123/details)',
						},
					},
				],
				extractValue: {
					type: 'regex',
					regex: '^(?:http|https)://(?:.+?)/documents/(\\d+)/details$',
				},
			},
		],
		placeholder: 'ID of the document',
		required: true,
		type: 'resourceLocator',
	},
	{
		displayName: 'Note ID',
		name: 'node_id',
		default: { mode: 'list', value: '' },
		description: 'ID of the note to remove',
		displayOptions: {
			show: {
				resource: ['document_note'],
				operation: ['remove'],
			},
		},
		hint: 'The ID of the note to remove',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				placeholder: `Select a Document...`,
				type: 'list',
				typeOptions: {
					searchListMethod: 'documentNoteSearch',
					searchFilterRequired: false,
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				placeholder: `Enter Document ID...`,
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[1-9][0-9]*$',
							errorMessage: 'The ID must be a positive integer',
						},
					},
				],
			},
		],
		placeholder: 'ID of the note',
		required: true,
		type: 'resourceLocator',
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const id = (this.getNodeParameter('id', itemIndex) as INodeParameterResourceLocator).value;
	const noteId = (this.getNodeParameter('node_id', itemIndex) as INodeParameterResourceLocator)
		.value;
	const endpoint = `/documents/${id}/notes/?id=${noteId}`;
	await apiRequest.call(this, itemIndex, 'DELETE', endpoint);

	return { json: { results: [true] } };
}
