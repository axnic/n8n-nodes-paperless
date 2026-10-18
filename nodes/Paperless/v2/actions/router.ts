import {
	IExecuteFunctions,
	INodeExecutionData,
	JsonObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import type { PaperlessType } from './node.type';

import * as asn from './asn/asn.resource';
import * as correspondent from './correspondent/correspondent.resource';
import * as custom_field from './custom_field/custom_field.resource';
import * as document from './document/document.resource';
import * as document_note from './document_note/document_note.resource';
import * as document_type from './document_type/document_type.resource';
import * as tag from './tag/tag.resource';
import * as task from './task/task.resource';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let itemIndex = 0; itemIndex < this.getInputData().length; itemIndex++) {
		const resource = this.getNodeParameter<PaperlessType>('resource', itemIndex);
		const operation = this.getNodeParameter('operation', itemIndex);
		const paperlessNodeData = { resource, operation } as PaperlessType;

		try {
			switch (paperlessNodeData.resource) {
				case 'asn':
					returnData.push(await asn[paperlessNodeData.operation].execute.call(this, itemIndex));
					break;
				case 'correspondent':
					returnData.push(
						await correspondent[paperlessNodeData.operation].execute.call(this, itemIndex),
					);
					break;
				case 'custom_field':
					returnData.push(
						await custom_field[paperlessNodeData.operation].execute.call(this, itemIndex),
					);
					break;
				case 'document':
					returnData.push(
						await document[paperlessNodeData.operation].execute.call(this, itemIndex),
					);
					break;
				case 'document_note':
					returnData.push(
						await document_note[paperlessNodeData.operation].execute.call(this, itemIndex),
					);
					break;
				case 'document_type':
					returnData.push(
						await document_type[paperlessNodeData.operation].execute.call(this, itemIndex),
					);
					break;
				case 'tag':
					returnData.push(await tag[paperlessNodeData.operation].execute.call(this, itemIndex));
					break;
				case 'task':
					returnData.push(await task[paperlessNodeData.operation].execute.call(this, itemIndex));
					break;
				default:
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${paperlessNodeData.operation}" on resource "${paperlessNodeData.resource}" is not supported.`,
					);
			}
		} catch (error) {
			if (error.description?.includes('cannot accept the provided value')) {
				error.description += ". Consider using 'Typecast' option";
			}
			throw error instanceof NodeApiError || error instanceof NodeOperationError
				? error
				: new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
		}
	}

	return [returnData];
}
