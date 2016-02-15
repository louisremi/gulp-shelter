# gulp-shelter
A cozy place for your shell tasks

## Npm Scripts as a build tool, or Gulp tasks?

Gulp-shelter brings the best of both worlds and makes everyone in the team happy.

## Installing

Gulp is the only hard dependency. But gulp-shelter will make your build scripts much simpler when written with template strings (**only compatible with Gulp v3.9.0+**).

`npm install --save-dev gulp-shelter gulp@"^3.9.0" babel-core babel-register babel-preset-es2015 gulp-cli`

Setup Babel to **use es2015**, if you haven't already:

`echo '{ "presets": ["es2015"] }' > .babelrc`

And finally name or rename your gulpfile to **`gulpfile.babel.js`**.

## Using

```js
const gulp = require('gulp');
const shelter = require('gulp-shelter')(gulp);
const BRANCH = process.env.TRAVIS_BRANCH;

// project config
const project = 'projectName';
const main = `src/main.js`;
const dest = `dist/${project}.js`;
const domain = (
  BRANCH === 'master' ? 'www.domain.com' :
  BRANCH === 'develop' ? 'dev.domain.com' :
  false
);

// commands and fragments
const browserifyOpts = `
	--standalone ${project}
	--transform [ babelify --presets [ es2015 react ] ]
	--debug`; // --debug enables source-map
const browserify = `browserify ${main} ${browserifyOpts}`;
const exorcist = `exorcist ${dest}.map > ${dest}`;
const watchify = `watchify ${main} ${browserifyOpts} -o ${dest}`;
const browsersync = `browser-sync start --server --files "${dest}, index.html"`;
const surge = domain ? `surge --project ./dist --domain ${domain}` : ':'; // ':' is noop in bash

// tasks definitions
shelter({
	build: {
		dsc: 'generate standalone ${project} lib and external source-map',
		cmd: `${browserify} | ${exorcist}`
	},
	serve: {
		dsc: 'Open index.html in the browser and live-reload on changes',
		cmd: `${watchify} & ${browsersync}`
	},
	deploy: {
		dsc: 'Task meant to be run by Travis to automatically deploy on Surge',
		cmd: `${browserify} | ${exorcist} && ${surge}`
	}
});
```

Note that it's not required that your command consist of `{ dsc: …, cmd: … }` objects.
A string will do as well, but adding a description will make your tasks discoverable and explicit using `gulp --tasks`;

### No global Gulp required

One of the advantages of npm scripts is that they do not require any other command line tools to be installed.
You can get the same benefit by adding the following lines to your `package.json`:
```json
"scripts": {
	"gulp": "gulp",
    "help": "gulp --tasks",
	…
},
```

Now tasks can be discovered by running **`npm run help`**, and individual tasks can be run with **`npm run gulp -- <task name>`**.

## License

MIT
