// dogfooding FTW!
const gulp = require('gulp');
const shelter = require('./index')(gulp);

const lint = 'eslint *.js';
const clear = 'rimraf .tmp && mkdir .tmp';
const echoNpm = `
	echo "hello from npm script"
		> .tmp/echonpm.txt
`;
const grepNpm = `
	grep -q
		'^hello from npm script$'
		.tmp/echonpm.txt
`;
const testNpm = `npm run test:npm && ${grepNpm}`;
const echoGulp = `
	echo "hello from gulp task"
		> .tmp/echogulp.txt
`;
const grepGulp = `
	grep -q
		'^hello from gulp task$'
		.tmp/echogulp.txt
`;
const testGulp = `gulp echo:gulp && ${grepGulp}`;

// TODO: tests won't pass on Windows because of grep
shelter({
	'test': {
		dsc: 'Test gulp-shelter',
		cmd: `${lint} && ${clear} && ${testNpm} && ${testGulp}`
	},
	'echo:npm': echoNpm,
	'echo:gulp': echoGulp
});
