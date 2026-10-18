import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
		// The operations read untyped Paperless-ngx API payloads and node parameters.
		files: ['nodes/**/actions/**/*.ts'],
		rules: { '@typescript-eslint/no-explicit-any': 'off' },
	},
];
