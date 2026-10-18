import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

/** A full response of the Paperless-ngx API, as returned by `apiRequestPaginated` for each page. */
export interface PageResponse {
	statusCode: number;
	statusMessage?: string;
	body: { results: IDataObject[]; details?: string };
}

type Context = IExecuteFunctions | ILoadOptionsFunctions;

// NOTE: `_itemIndex` is kept so that every caller keeps its signature; the
// credentials do not depend on the item with `httpRequestWithAuthentication`.
export async function apiRequest(
	this: Context,
	_itemIndex: number,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
	option: Partial<IHttpRequestOptions> = {},
): Promise<unknown> {
	const credentials = await this.getCredentials('paperlessApi');
	const options: IHttpRequestOptions = {
		method,
		url: `${credentials.url}${endpoint}`,
		qs: query ?? {},
		json: true,
		...option,
	};

	if (Object.keys(body).length) {
		options.body = body;
	}

	return await this.helpers.httpRequestWithAuthentication.call(this, 'paperlessApi', options);
}

/**
 * Follows the `next` link of every page and returns all the full responses
 * (`statusCode`, `statusMessage`, `headers` and `body`).
 */
export async function apiRequestPaginated(
	this: Context,
	_itemIndex: number,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
): Promise<unknown[]> {
	const credentials = await this.getCredentials('paperlessApi');
	const responses: unknown[] = [];

	let url: string | null = `${credentials.url}${endpoint}`;
	let qs: IDataObject = query ?? {};
	while (url) {
		const options: IHttpRequestOptions = {
			method,
			url,
			qs,
			json: true,
			returnFullResponse: true,
		};
		if (Object.keys(body).length) {
			options.body = body;
		}

		const response = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'paperlessApi',
			options,
		)) as { body?: { next?: string | null } };
		responses.push(response);

		// `next` already carries the query string of the following page
		url = response.body?.next ?? null;
		qs = {};
	}

	return responses;
}
