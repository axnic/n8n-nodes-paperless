// gitsym commit format: https://github.com/axnic/gitsym
module.exports = {
	extends: ['@axnic/commitlint-config-gitsym'],
	rules: {
		'scope-enum': [
			2,
			'always',
			['n8n-node', 'document', 'credentials', 'nodejs', 'mise', 'rtunk', 'ci', 'deps', 'readme', 'repo'],
		],
	},
};
