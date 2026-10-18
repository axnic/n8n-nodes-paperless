import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameterResourceLocator,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'ID',
		name: 'id',
		default: { mode: 'list', value: '' },
		description: 'ID of the document',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['update'],
			},
		},
		hint: 'The ID of the document',
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
		displayName: 'Update Fields',
		name: 'update_fields',
		type: 'collection',
		default: {},
		hint: 'All additional fields are automatically added to the document by Paperless if they are not set',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['update'],
			},
		},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'Append Tags',
				name: 'append_tags',
				type: 'boolean',
				default: false,
				description:
					'Whether to append the new tags to the existing ones instead of replacing them',
			},
			{
				displayName: 'Archive Serial Number',
				name: 'archive_serial_number',
				default: '',
				description: 'The archive serial number of the document',
				type: 'number',
			},
			{
				displayName: 'Correspondent',
				name: 'correspondent',
				default: { mode: 'list', value: '' },
				description: 'The correspondent ID of the document',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						placeholder: `Select a Correspondent...`,
						type: 'list',
						typeOptions: {
							searchListMethod: 'correspondentSearch',
							searchFilterRequired: false,
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						placeholder: `Enter Correspondent ID...`,
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
				type: 'resourceLocator',
			},
			{
				displayName: 'Created',
				name: 'created',
				default: '',
				description: 'The date and time the document was created',
				type: 'dateTime',
			},
			{
				displayName: 'Custom Fields',
				name: 'custom_fields',
				default: {},
				description: 'The custom field of the document',
				options: [
					{
						displayName: 'Custom Field',
						name: 'values',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								default: { mode: 'list', value: '' },
								description: 'The custom field ID',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										placeholder: `Select a Custom Field...`,
										type: 'list',
										typeOptions: {
											searchListMethod: 'customFieldSearch',
											searchFilterRequired: false,
											searchable: true,
										},
									},
									{
										displayName: 'By ID',
										name: 'id',
										placeholder: `Enter Custom Field ID...`,
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
								type: 'resourceLocator',
							},
							{
								displayName: 'Value',
								name: 'value',
								default: '',
								description: 'The custom field value',
								type: 'string',
							},
						],
					},
				],
				placeholder: 'Add Custom Field',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
			},
			{
				displayName: 'Document Type',
				name: 'document_type',
				default: { mode: 'list', value: '' },
				description: 'The document type ID of the document',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						placeholder: `Select a Document Type...`,
						type: 'list',
						typeOptions: {
							searchListMethod: 'documentTypeSearch',
							searchFilterRequired: false,
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						placeholder: `Enter Document Type ID...`,
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
				type: 'resourceLocator',
			},
			{
				displayName: 'Storage Path',
				name: 'storage_path',
				default: { mode: 'list', value: '' },
				description: 'The storage path ID of the document',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						placeholder: `Select a Storage Path...`,
						type: 'list',
						typeOptions: {
							searchListMethod: 'storagePathSearch',
							searchFilterRequired: false,
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						placeholder: `Enter Storage Path ID...`,
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
				type: 'resourceLocator',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				default: {},
				description: 'The tag IDs of the document',
				options: [
					{
						displayName: 'Tag',
						name: 'values',
						values: [
							{
								displayName: 'Tag',
								name: 'tag',
								default: { mode: 'list', value: '' },
								description: 'The tag ID',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										placeholder: `Select a Tag...`,
										type: 'list',
										typeOptions: {
											searchListMethod: 'tagSearch',
											searchFilterRequired: false,
											searchable: true,
										},
									},
									{
										displayName: 'By ID',
										name: 'id',
										placeholder: `Enter Tag ID...`,
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
								type: 'resourceLocator',
							},
						],
					},
				],
				placeholder: 'Add Tag',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
			},
			{
				displayName: 'Title',
				name: 'title',
				default: '',
				description: 'The title of the document',
				type: 'string',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const id = (this.getNodeParameter('id', itemIndex) as INodeParameterResourceLocator).value;
	const endpoint = `/documents/${id}/`;

	const updateFields = this.getNodeParameter('update_fields', itemIndex, {}) as any;

	let tags = updateFields.tags?.values.map((tag: any) => Number(tag.tag.value));

	if (updateFields.append_tags && tags && tags.length > 0) {
		const currentDocument = (await apiRequest.call(this, itemIndex, 'GET', endpoint)) as any;
		const currentTags = (currentDocument.tags || []).map((t: any) => Number(t));
		tags = [...new Set([...currentTags, ...tags])];
	}

	const body = {
		archive_serial_number: updateFields.archive_serial_number,
		correspondent: updateFields.correspondent?.value,
		created: updateFields.created,
		custom_fields: updateFields.custom_fields?.values.map((customField: any) => ({
			field: customField.field.value,
			value: customField.value,
		})),
		document_type: updateFields.document_type?.value,
		storage_path: updateFields.storage_path?.value,
		tags,
		title: updateFields.title,
	};

	const response = (await apiRequest.call(this, itemIndex, 'PATCH', endpoint, body)) as any;

	return { json: { results: [response] } };
}
