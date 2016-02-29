# gulp-shelter
A cozy place for your shell tasks

## Npm Scripts as a build tool, or Gulp tasks?

Gulp-shelter brings the best of both worlds and makes everyone in the team happy. Read the [blog post](https://medium.com/@Louis_Remi/npm-scripts-vs-gulp-round-2-feat-gulp-shelter-c003db6a148b).

## Installing

This is the recommended installation for a fresh **new project** with **[Node v4+](https://nodejs.org/)** installed locally.
See [legacy config](#legacy-config) below if you're in a different situation.

`npm install --save-dev gulp-shelter gulpjs/gulp#4.0`

(Having Gulp v3 installed globally should not be a problem.)

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
const browserifyFlags = `
	--standalone ${project}
	--transform [ babelify --presets [ es2015 react ] ]
	--debug`; // --debug enables source-map
const browserify = `browserify ${main} ${browserifyFlags}`;
const exorcist = `exorcist ${dest}.map > ${dest}`;
const watchify = `watchify ${main} ${browserifyFlags} -o ${dest}`;
const browsersync = `browser-sync start --server --files "${dest}, index.html"`;
const surge = domain ? `surge --project ./dist --domain ${domain}` : ':'; // ':' is noop in bash

// tasks definitions
shelter({
	build: {
		dsc: `generate ${project} lib and external source-map`,
		cmd: `${browserify} | ${exorcist}`
	},
	serve: {
		dsc: 'Open index.html and live-reload on changes',
		cmd: `${watchify} & ${browsersync}`
	},
	deploy: {
		dsc: 'Run by Travis to automatically deploy on Surge',
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
    "help": "gulp --tasks"
},
```

Now tasks can be discovered by running **`npm run help`**, and individual tasks can be run with **`npm run gulp -- <task name>`**.

## Legacy config

### Older versions of Node

Versions of Node prior to v4 did not support template strings out of the box.
Thankfully, Gulp v3.9+ is able to read special gulpfiles that contain ES6 syntax.

Install the following additional dependencies:

`npm install --save-dev babel-core babel-register babel-preset-es2015`

Setup Babel to use es2015, if you haven't already:

`echo '{ "presets": ["es2015"] }' > .babelrc`

And finally name or rename your gulpfile to **`gulpfile.babel.js`**.

### Older versions of Gulp

If you plan on using the `npm run help` task described above with Gulp 3.X,
you will need a local version of gulp-cli for task descriptions to be displayed in the console.

`npm install --save-dev gulp-cli`

## License

MIT
