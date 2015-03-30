var path = require('path'),
	childProcess = require('child_process'),
	_ = require('lodash');

var gulp,
	templates = {},
	config = {};

function taskBuilder( name, _task ) {
	var task = {};


	if ( typeof _task.cmd === 'function' ) {
		task.fn = _task.cmd;

	} else if ( typeof _task.cmd === 'string' ) {
		task.cmd = _task.cmd;

	} else if ( Array.isArray( _task.cmd ) ) {
		task.cmd = _task.cmd.join(' ');
	}

	if ( !task.fn && task.cmd ) {
		templates[name] = _.template( task.cmd );

		// make the command available to templates
		// (interpolate template recursively when it's used)
		Object.defineProperty(config, name, {
			get: function() {
				return templates[name]( config );
			}
		});

		task.fn = function(done) {
			var opts = _.defaults( task.opts || {}, {
					cwd: process.cwd(),
					env: process.env,
					stdio: 'inherit',
					usePowerShell: false
				}),
				spawnOpts = {
					cwd: opts.cwd,
					env: opts.env,
					stdio: opts.stdio
				},
				// use getter defined above to retrieve the interpolated command
				command = config[ name ],
				oldPath = opts.env.PATH,
				subshell;

			// Include node_modules/.bin on the path
			spawnOpts.env.PATH =
				path.join( process.cwd(), 'node_modules', '.bin') +
				path.delimiter + oldPath;

			subshell = process.platform.lastIndexOf('win') === 0 ?
				( opts.usePowerShell ?
					childProcess.spawn( 'powershell.exe',
						[ '-NonInteractive', '-NoLogo', '-Command', command ],
						spawnOpts ) :
					childProcess.spawn( 'cmd.exe',
						[ '/c', command ], spawnOpts )
				) :
				childProcess.spawn( 'sh', [ '-c', command ], spawnOpts );

			subshell.once('close', function(code) {
				if ( code !== 0 ) {
					var err = new Error(
						'Command `' + command + '` exited with code ' + code
					);

					err.status = code;
					return done(err);
				}

				done(null);
			});
		};
	}

	if ( task.fn ) {
		gulp.task( name, task.fn );
		if ( _task.dsc ) {
			task.fn.description = _.template( _task.dsc )( config );
		}
	}
}

function shelter( _config ) {
	if ( !_config ) {
		return;
	}

	_.forEach(_config, function( prop, key ) {
		if ( Array.isArray( prop ) ) {
			prop = prop.join(' ');
		}

		if ( typeof prop === 'string' ) {
			templates[key] = _.template( prop );
			Object.defineProperty( config, key, {
				get: function() {
					return templates[key]( config );
				}
			});

		} else if ( typeof prop === 'object' ) {
			taskBuilder( key, prop );
		}
	});
}

shelter.task = taskBuilder;

// module must be required with `require('gulp-shelter')(gulp, run)`
// to be able to register tasks
module.exports = function( _gulp ) {
	gulp = _gulp;
	return shelter;
};
