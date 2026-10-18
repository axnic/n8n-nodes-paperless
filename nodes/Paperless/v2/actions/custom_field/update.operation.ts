import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameterResourceLocator,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createHash } from 'crypto';

export const description: INodeProperties[] = [
	{
		displayName: 'ID',
		name: 'id',
		description: 'ID of the custom field',
		default: { mode: 'list', value: '' },
		displayOptions: {
			show: {
				resource: ['custom_field'],
				operation: ['update'],
			},
		},
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
		placeholder: 'ID of the custom_field',
		required: true,
		type: 'resourceLocator',
	},
	{
		displayName: 'Update Fields',
		name: 'update_fields',
		description: 'Fields of the custom field to change; the ones left out are kept as they are',
		default: {},
		displayOptions: {
			show: {
				resource: ['custom_field'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				description: 'Name of the custom field',
				placeholder: 'Name of the custom field',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Select Options',
				name: 'select_options',
				default: [],
				description: 'The options for the select data type',
				options: [
					{
						displayName: 'Option',
						name: 'option',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'The name of the select option',
							},
						],
					},
				],
				placeholder: 'Add Option',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
			},
			{
				displayName: 'Default Currency',
				name: 'default_currency',
				default: '',
				description: 'The default currency for the monetary data type',
				type: 'string',
			},
		],
		placeholder: 'Add Field',
		type: 'collection',
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const id = (this.getNodeParameter('id', itemIndex) as INodeParameterResourceLocator).value;
	const endpoint = `/custom_fields/${id}/`;

	const updateFields = this.getNodeParameter('update_fields', itemIndex, {}) as {
		name?: string;
		select_options?: { option: { name: string }[] };
		default_currency?: string;
	};
	const body: { name?: string; extra_data?: IDataObject } = {};

	if (updateFields.name) {
		body.name = updateFields.name;
	}
	if (updateFields.select_options) {
		body.extra_data = {};
		body.extra_data.select_options = updateFields.select_options.option.map(
			(option) => ({
				label: option.name.trim(),
				id: createHash('sha256').update(option.name.trim()).digest('hex'),
			}),
		);
	}
	if (updateFields.default_currency) {
		body.extra_data = body.extra_data || {};
		body.extra_data.default_currency = updateFields.default_currency;
	}

	const response = (await apiRequest.call(this, itemIndex, 'PATCH', endpoint, body)) as IDataObject;

	return { json: { results: [response] } };
}
