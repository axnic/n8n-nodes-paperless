import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';
import { apiRequestPaginated, PageResponse } from '../../transport';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const endpoint = '/custom_fields/';
	const responses = (await apiRequestPaginated.call(this, itemIndex, 'GET', endpoint)) as PageResponse[];

	const statusCode =
		responses.reduce((acc, response) => acc + response.statusCode, 0) / responses.length;
	if (statusCode !== 200) {
		throw new NodeOperationError(
			this.getNode(),
			`The custom fields you are requesting could not be found`,
			{
				description: JSON.stringify(
					responses.map((response) => response?.body?.details ?? response?.statusMessage),
				),
			},
		);
	}
	return {
		json: { results: responses.map((response) => response.body.results).flat() },
	};
}
