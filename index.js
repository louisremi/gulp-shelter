var path = require('path');
var childProcess = require('child_process');
var _ = require('lodash');

var gulp;

function taskBuilder( name, _task ) {
	var task = (
		typeof _task === 'string' ?
			{ cmd: _task } :
			task = _task
	);

	if ( task.cmd ) {
		task.cmd = (
			task.cmd
				.trim()
				// prepend backslash to newlines
				.replace(/\n/g, ' \\\n')
				// replace tabs
				.replace(/\t/g, '    ')
		);

		task.fn = function(done) {
			var opts = _.defaults( task.opts || {}, {
					cwd: process.cwd(),
					env: process.env,
					stdio: 'inherit',
					usePowerShell: false
				});
			var spawnOpts = {
					cwd: opts.cwd,
					env: opts.env,
					stdio: opts.stdio
				};
			var oldPath = opts.env.PATH;
			var subshell;

			// Include node_modules/.bin on the path
			spawnOpts.env.PATH =
				path.join( process.cwd(), 'node_modules', '.bin' ) +
				path.delimiter + oldPath;

			subshell = process.platform.lastIndexOf('win') === 0 ?
				( opts.usePowerShell ?
					childProcess.spawn( 'powershell.exe',
						[ '-NonInteractive', '-NoLogo', '-Command', task.cmd ],
						spawnOpts ) :
					childProcess.spawn( 'cmd.exe',
						[ '/c', task.cmd ], spawnOpts )
				) :
				childProcess.spawn( 'sh', [ '-c', task.cmd ], spawnOpts );

			subshell.once('close', function(code) {
				if ( code !== 0 ) {
					var err = new Error(
						'Command `' + task.cmd + '` exited with code ' + code
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
		if ( 'dsc' in task ) {
			task.fn.description = _task.dsc;
		}
		if ( 'flg' in task ) {
			task.fn.flags = _task.flg;
		}
	}
}

function shelter( tasks ) {
	if ( !tasks ) {
		return;
	}

	_.forEach(tasks, function( prop, key ) {
		taskBuilder( key, prop );
	});
}

shelter.task = taskBuilder;

// module must be required with `require('gulp-shelter')(gulp)`
// to be able to register tasks
module.exports = function( _gulp ) {
	gulp = _gulp;
	return shelter;
};
