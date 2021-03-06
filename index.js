var traceurAPI = require('traceur/src/node/api.js');
var path = require('path');
var fs = require('fs');

function TraceurCompiler(config) {
	this.shouldCompile = /^app/;
	this.options = {
		modules: false,
		sourceMaps: false // let brunch handle the sourcemaps
	};

	if (typeof config.modules.wrapper === 'string') {
		this.options.modules = config.modules.wrapper;
	}

	if (config.plugins && config.plugins.traceur) {
		this.shouldCompile = config.plugins.traceur.paths || this.shouldCompile;

		for (var i in config.plugins.traceur.options) {
			this.options[i] = config.plugins.traceur.options[i];
		}
	}

	this.compiler = new traceurAPI.NodeCompiler(this.options);
}

TraceurCompiler.prototype.brunchPlugin = true;
TraceurCompiler.prototype.type = 'javascript';
TraceurCompiler.prototype.extension = 'js';

TraceurCompiler.prototype.compile = function(data, path, callback) {
	// Only compile from the specified paths.
	if (!this.shouldCompile.test(path)) {
		return callback(null, {data: data});
	}

	try {
		var es5 = this.compiler.compile(data, false, false);
	} catch(err) {
		callback(err);
		return;
	}

	callback(null, {
		data: es5 + '\n'
	});
};

var nestedPath = path.join(__dirname, 'node_modules', 'traceur', 'bin', 'traceur-runtime.js');
var flatPath = path.join(process.cwd(), 'node_modules', 'traceur', 'bin', 'traceur-runtime.js');

fs.lstat(nestedPath, function(err, stats) {
    if (!err && stats.isDirectory()) {
        TraceurCompiler.prototype.include = [nestedPath];
    } else {
        TraceurCompiler.prototype.include = [flatPath];
    }
});

module.exports = TraceurCompiler;
