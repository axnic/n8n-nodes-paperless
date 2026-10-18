import { createHash } from 'crypto';
import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		description: 'Name of the custom field',
		displayOptions: {
			show: {
				resource: ['custom_field'],
				operation: ['create'],
			},
		},
		placeholder: 'Name of the custom field',
		required: true,
		type: 'string',
		default: '',
	},
	{
		displayName: 'Data Type',
		name: 'data_type',
		default: 'string',
		description: 'The data type of the custom field',
		displayOptions: {
			show: {
				resource: ['custom_field'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Boolean', value: 'boolean' },
			{ name: 'Date', value: 'date' },
			{ name: 'Document Link', value: 'documentlink' },
			{ name: 'Float', value: 'float' },
			{ name: 'Integer', value: 'integer' },
			{ name: 'Monetary', value: 'monetary' },
			{ name: 'Select', value: 'select' },
			{ name: 'String', value: 'string' },
			{ name: 'URL', value: 'url' },
		],
		type: 'options',
	},
	{
		displayName: 'Select Options',
		name: 'select_options',
		default: [],
		description: 'The options for the select data type',
		displayOptions: {
			show: {
				resource: ['custom_field'],
				operation: ['create'],
				data_type: ['select'],
			},
		},
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
		displayOptions: {
			show: {
				resource: ['custom_field'],
				operation: ['create'],
				data_type: ['monetary'],
			},
		},
		type: 'string',
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const endpoint = `/custom_fields/`;
	const extraData: IDataObject = {};
	const body = {
		name: this.getNodeParameter('name', itemIndex),
		data_type: this.getNodeParameter('data_type', itemIndex),
		extra_data: extraData,
	};

	this.logger.debug(
		`Creating custom field: ${JSON.stringify(this.getNodeParameter('select_options', itemIndex, null))}`,
	);

	const selectOptions = this.getNodeParameter('select_options', itemIndex, null) as { option: { name: string }[] } | null;
	if (selectOptions) {
		extraData.select_options = selectOptions.option.map((option) => ({
			label: option.name.trim(),
			id: createHash('sha256').update(option.name.trim()).digest('hex'),
		}));
	}
	const defaultCurrency = this.getNodeParameter('default_currency', itemIndex, null) as string | null;
	if (defaultCurrency) {
		extraData.default_currency = defaultCurrency;
	}

	const response = (await apiRequest.call(this, itemIndex, 'POST', endpoint, body)) as IDataObject;

	return { json: { results: [response] } };
}
