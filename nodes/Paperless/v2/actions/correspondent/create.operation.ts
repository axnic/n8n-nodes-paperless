import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		description: 'Name of the correspondent',
		displayOptions: {
			show: {
				resource: ['correspondent'],
				operation: ['create'],
			},
		},
		placeholder: 'Name of the correspondent',
		required: true,
		type: 'string',
		default: '',
	},
	{
		displayName: 'Matching Algorithm',
		name: 'matching_algorithm',
		description: 'How Paperless-ngx automatically assigns documents to this correspondent',
		default: 6,
		displayOptions: {
			show: {
				resource: ['correspondent'],
				operation: ['create'],
			},
		},
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
		displayOptions: {
			show: {
				resource: ['correspondent'],
				operation: ['create'],
				matching_algorithm: [1, 2, 3, 4, 5],
			},
		},
		placeholder: 'Matching expression to match',
		type: 'string',
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const endpoint = `/correspondents/`;
	const body = {
		name: this.getNodeParameter('name', itemIndex),
		matching_algorithm: this.getNodeParameter('matching_algorithm', itemIndex),
		match: this.getNodeParameter('match', itemIndex, ''),
	};

	const response = (await apiRequest.call(this, itemIndex, 'POST', endpoint, body)) as any;

	return { json: { results: [response] } };
}
