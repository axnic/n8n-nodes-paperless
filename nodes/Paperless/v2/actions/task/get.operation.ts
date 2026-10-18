import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'ID',
		name: 'id',
		description: 'ID of the task',
		default: '',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['get'],
			},
		},
		placeholder: 'ID of the task',
		required: true,
		type: 'string',
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const task_id = this.getNodeParameter('id', itemIndex);

	// Up to Paperless-ngx 2.x the task list is a plain array, from 3.0 it is paginated.
	const response = (await apiRequest.call(this, itemIndex, 'GET', '/tasks/', undefined, {
		task_id,
	})) as any;
	const tasks: any[] = Array.isArray(response) ? response : (response?.results ?? []);
	const task = tasks.find((task) => task.task_id === task_id);

	if (!task) {
		throw new NodeOperationError(this.getNode(), `Task with ID ${task_id} not found.`);
	}

	return {
		json: { results: [task] },
	};
}
