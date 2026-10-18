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
		description: 'ID of the correspondent',
		default: { mode: 'list', value: '' },
		displayOptions: {
			show: {
				resource: ['correspondent'],
				operation: ['remove'],
			},
		},
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
		placeholder: 'ID of the correspondent',
		required: true,
		type: 'resourceLocator',
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const id = (this.getNodeParameter('id', itemIndex) as INodeParameterResourceLocator).value;
	const endpoint = `/correspondents/${id}/`;
	await apiRequest.call(this, itemIndex, 'DELETE', endpoint);

	return { json: { results: [true] } };
}
