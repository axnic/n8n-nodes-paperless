// End-to-end tests: every operation of the node against a real Paperless-ngx.
// Start one with docker-compose.test.yml, then `pnpm build && node --test tests/e2e`.
const assert = require('node:assert/strict');
const { before, describe, it } = require('node:test');
const { run, sleep } = require('./harness');

const id = (value) => ({ value });
const results = (item) => item.json.results;

/** Creates, reads, updates, lists then deletes one object of a plain resource. */
function crud(resource, extra = {}) {
	describe(resource, () => {
		const name = `e2e-${resource}-${Date.now()}`;
		let created;

		it('creates', async () => {
			[created] = results(await run(resource, 'create', { name, matching_algorithm: 0, ...extra }));
			assert.equal(created.name, name);
		});

		it('gets', async () => {
			const [found] = results(await run(resource, 'get', { id: id(created.id) }));
			assert.equal(found.id, created.id);
		});

		it('updates', async () => {
			const [updated] = results(
				await run(resource, 'update', { id: id(created.id), update_fields: { name: `${name}-2` } }),
			);
			assert.equal(updated.name, `${name}-2`);
		});

		it('lists', async () => {
			assert.ok(results(await run(resource, 'list')).some((found) => found.id === created.id));
		});

		it('removes', async () => {
			await run(resource, 'remove', { id: id(created.id) });
			await assert.rejects(run(resource, 'get', { id: id(created.id) }), { httpCode: '404' });
		});
	});
}

describe('Paperless-ngx', () => {
	it('gives the next ASN', async () => {
		assert.equal(typeof results(await run('asn', 'next'))[0], 'number');
	});

	crud('tag');
	crud('correspondent');
	crud('document_type');
	crud('custom_field', { data_type: 'string' });

	describe('document', () => {
		const title = `e2e-document-${Date.now()}`;
		let documentId;
		let tagId;

		before(async () => {
			[{ id: tagId }] = results(await run('tag', 'create', { name: `${title}-tag`, matching_algorithm: 0 }));
			const [taskId] = results(
				await run(
					'document',
					'create',
					{ binary_property_name: 'data', additional_fields: { title } },
					{
						data: {
							data: Buffer.from(`${title}\nHello from the n8n Paperless-ngx node.\n`).toString('base64'),
							fileName: 'e2e.txt',
							mimeType: 'text/plain',
						},
					},
				),
			);

			// The upload is consumed asynchronously: wait for the document to show up.
			for (let attempt = 0; attempt < 60 && !documentId; attempt++) {
				await sleep(2000);
				documentId = results(await run('document', 'list')).find((found) => found.title === title)?.id;
			}
			assert.ok(documentId, `document "${title}" was not consumed (task ${taskId})`);
		});

		it('gets a task', async () => {
			// post_document returns the task id; the task list is the only way to read it back.
			const [taskId] = results(
				await run(
					'document',
					'create',
					{ binary_property_name: 'data', additional_fields: { title: `${title}-again` } },
					{ data: { data: Buffer.from(`${title} again\n`).toString('base64'), fileName: 'again.txt', mimeType: 'text/plain' } },
				),
			);
			const [task] = results(await run('task', 'get', { id: taskId }));
			assert.equal(task.task_id, taskId);
		});

		it('gets', async () => {
			assert.equal(results(await run('document', 'get', { id: id(documentId) }))[0].title, title);
		});

		it('updates, and appends tags', async () => {
			const [updated] = results(
				await run('document', 'update', {
					id: id(documentId),
					update_fields: {
						title: `${title}-2`,
						tags: { values: [{ tag: id(tagId) }] },
						append_tags: true,
					},
				}),
			);
			assert.equal(updated.title, `${title}-2`);
			assert.ok(updated.tags.includes(tagId));
		});

		it('gets the metadata', async () => {
			assert.ok(results(await run('document', 'get_metadata', { id: id(documentId) })).length > 0);
		});

		it('gets the history', async () => {
			assert.ok(results(await run('document', 'get_history', { id: id(documentId) })).length > 0);
		});

		it('gets the metadata suggestions', async () => {
			assert.ok(await run('document', 'get_metadata_suggestions', { id: id(documentId) }));
		});

		it('gets the share links', async () => {
			assert.ok(await run('document', 'get_sharelink', { id: id(documentId) }));
		});

		it('gets the preview', async () => {
			const item = await run('document', 'get_preview', { id: id(documentId) });
			assert.ok(item.binary.data.data.length > 0);
		});

		it('creates, lists and removes a note', async () => {
			await run('document_note', 'create', { id: id(documentId), note: 'e2e note' });
			const notes = results(await run('document_note', 'list', { id: id(documentId) }));
			const note = notes.find((found) => found.note === 'e2e note');
			assert.ok(note);
			await run('document_note', 'remove', { id: id(documentId), node_id: id(note.id) });
		});

		it('removes', async () => {
			await run('document', 'remove', { id: id(documentId) });
			await assert.rejects(run('document', 'get', { id: id(documentId) }), { httpCode: '404' });
		});
	});
});
