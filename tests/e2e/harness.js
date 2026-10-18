// Runs the compiled node against a real Paperless-ngx: a minimal stand-in for the IExecuteFunctions
// n8n gives to a node, with the HTTP helpers backed by fetch. Needs `pnpm build` first.
const { router } = require('../../dist/nodes/Paperless/v2/actions/router');

const BASE_URL = (process.env.PAPERLESS_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const USER = process.env.PAPERLESS_ADMIN_USER ?? 'admin';
const PASSWORD = process.env.PAPERLESS_ADMIN_PASSWORD ?? 'e2e-admin-password';

async function sleep(ms) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}

let token;

/** Waits for the API, then exchanges the admin account for an API token (once per run). */
async function getToken() {
	token ??= fetchToken();
	return token;
}

async function fetchToken() {
	const deadline = Date.now() + 5 * 60_000;
	for (;;) {
		try {
			const response = await fetch(`${BASE_URL}/api/token/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: USER, password: PASSWORD }),
			});
			if (response.ok) return (await response.json()).token;
		} catch {
			// not up yet
		}
		if (Date.now() > deadline) throw new Error(`Paperless-ngx is not ready at ${BASE_URL}`);
		await sleep(3000);
	}
}

function toForm(formData) {
	const form = new FormData();
	for (const [key, value] of Object.entries(formData)) {
		if (value && typeof value === 'object' && 'value' in value) {
			form.append(key, new Blob([value.value], { type: value.options?.contentType }), value.options?.filename);
		} else {
			form.append(key, String(value));
		}
	}
	return form;
}

async function send(token, options, uri = options.uri) {
	const url = new URL(uri);
	for (const [key, value] of Object.entries(options.qs ?? {})) url.searchParams.set(key, String(value));

	const headers = { Authorization: `Token ${token}`, Accept: 'application/json', ...options.headers };
	let body;
	if (options.formData) {
		body = toForm(options.formData);
	} else if (options.body !== undefined) {
		headers['Content-Type'] = 'application/json';
		body = JSON.stringify(options.body);
	}

	const response = await fetch(url, { method: options.method, headers, body });
	const raw = Buffer.from(await response.arrayBuffer());
	const isJson = (response.headers.get('content-type') ?? '').includes('json');
	const result = {
		statusCode: response.status,
		statusMessage: response.statusText,
		headers: Object.fromEntries(response.headers),
		body: isJson ? JSON.parse(raw.toString() || 'null') : raw,
	};
	if (!response.ok) {
		const error = new Error(`${response.status} - ${raw.toString().slice(0, 500)}`);
		error.httpCode = String(response.status);
		throw error;
	}
	return result;
}

/** The stand-in for IExecuteFunctions: `params` are the node parameters, `binary` the input binary data. */
function createContext(token, params, binary = {}) {
	return {
		getNode: () => ({ name: 'Paperless-ngx', type: 'paperless', typeVersion: 2 }),
		getInputData: () => [{ json: {} }],
		getCredentials: async () => ({ url: `${BASE_URL}/api`, apiKey: token }),
		getNodeParameter(name, _index, fallback) {
			if (params[name] !== undefined) return params[name];
			if (arguments.length > 2) return fallback;
			throw new Error(`Missing node parameter "${name}"`);
		},
		logger: { debug() {} },
		helpers: {
			async requestWithAuthentication(_credentialType, options) {
				const result = await send(token, options);
				return options.resolveWithFullResponse ? result : result.body;
			},
			async requestWithAuthenticationPaginated(options) {
				const pages = [];
				let uri = options.uri;
				let query = options;
				do {
					const page = await send(token, query, uri);
					pages.push(page);
					uri = page.body?.next;
					query = { method: options.method };
				} while (uri);
				return pages;
			},
			assertBinaryData: (_index, name) => binary[name],
			getBinaryStream: async (id) => binary[id].data,
			prepareBinaryData: async (data, fileName, mimeType) => ({
				data: Buffer.from(data).toString('base64'),
				fileName,
				mimeType,
			}),
		},
	};
}

/** Runs one operation of the node, as n8n would, and returns the JSON `results` of its output item. */
async function run(resource, operation, params = {}, binary) {
	const token = await getToken();
	const [[item]] = await router.call(createContext(token, { resource, operation, ...params }, binary));
	return item;
}

module.exports = { run, sleep };
