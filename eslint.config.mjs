import ljharb from '@ljharb/eslint-config/flat';

export default [
	...ljharb,
	{
		rules: {
			'max-lines-per-function': 'off',
			'new-cap': [
				'error', {
					capIsNewExceptions: [
						'HasOwnProperty',
						'IsCallable',
					],
				},
			],
		},
	},
];
