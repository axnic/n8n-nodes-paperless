import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Binary Field',
		name: 'binary_property_name',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['create'],
			},
		},
		hint: 'The name of the input field containing the file data to be processed',
		required: true,
		type: 'string',
	},
	{
		displayName: 'Additional Fields',
		name: 'additional_fields',
		type: 'collection',
		default: {},
		hint: 'All additional fields are automatically added to the document by Paperless if they are not set',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['create'],
			},
		},
		placeholder: 'Add Field',
		options: [
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
				displayName: 'Title',
				name: 'title',
				default: '',
				description: 'The title of the document',
				type: 'string',
			},
		],
	},
	{
		displayName:
			'Custom fields and tags are not yet supported on document creation... Use the update operation to set these values',
		name: 'notice_not_supported',
		default: '',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['create'],
			},
		},
		type: 'notice',
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const endpoint = `/documents/post_document/`;

	const binaryPropertyName = this.getNodeParameter('binary_property_name', itemIndex) as string;
	const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const data = binaryData.id
		? await this.helpers.getBinaryStream(binaryData.id)
		: Buffer.from(binaryData.data, 'base64');

	const formData: Record<string, unknown> = {
		document: {
			value: data,
			options: {
				filename: binaryData.fileName,
				contentType: binaryData.mimeType,
			},
		},
	};

	const additionalFields = this.getNodeParameter('additional_fields', itemIndex) as any;
	Object.entries({
		archive_serial_number: additionalFields.archive_serial_number,
		correspondent: additionalFields.correspondent?.value,
		created: additionalFields.created,
		document_type: additionalFields.document_type?.value,
		storage_path: additionalFields.storage_path?.value,
		title: additionalFields.title,
	})
		.filter(([, value]) => value !== undefined && value !== '')
		.forEach(([key, value]) => {
			formData[key] = String(value);
		});

	const response = (await apiRequest.call(
		this,
		itemIndex,
		'POST',
		endpoint,
		undefined,
		undefined,
		{ formData },
	)) as any;

	return { json: { results: [response] } };
}
