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
		description: 'ID of the tag',
		default: { mode: 'list', value: '' },
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['update'],
			},
		},
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
		placeholder: 'ID of the tag',
		required: true,
		type: 'resourceLocator',
	},
	{
		displayName: 'Update Fields',
		name: 'update_fields',
		description: 'Fields of the tag to change; the ones left out are kept as they are',
		default: {},
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				description: 'Name of the tag',
				placeholder: 'Name of the tag',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Matching Algorithm',
				name: 'matching_algorithm',
				description: 'How Paperless-ngx automatically assigns documents to this tag',
				default: 6,
				options: [
					{ name: 'None: Disable matching', value: 0 },
					{ name: 'Any: Document contains any of these words (space separated)', value: 1 },
					{ name: 'All: Document contains all of these words (space separated)', value: 2 },
					{ name: 'Exact: Document contains this string', value: 3 },
					{ name: 'Regular Expression: Document Matches This Regular Expression', value: 4 },
					{ name: 'Fuzzy: Document contains a word similar to this word', value: 5 },
					{ name: 'Auto: Learn matching automatically', value: 6 },
				],
				type: 'options',
			},
			{
				displayName: 'Matching Expression',
				name: 'match',
				description: 'Word, string or regular expression used by the matching algorithm',
				default: '',
				placeholder: 'Matching expression to match',
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
	const endpoint = `/tags/${id}/`;

	const updateFields = this.getNodeParameter('update_fields', itemIndex, {}) as {
		[key: string]: any;
	};
	const body: { [key: string]: any } = {};

	for (const key of Object.keys(updateFields)) {
		if (updateFields[key] !== null && updateFields[key] !== undefined) {
			body[key] = updateFields[key];
		}
	}

	const response = (await apiRequest.call(this, itemIndex, 'PATCH', endpoint, body)) as any;

	return { json: { results: [response] } };
}
