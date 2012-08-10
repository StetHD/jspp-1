//JavaScript++ REPL

; module.exports = function(jspp) {
	var readline = require('readline'),
		repl     = readline.createInterface(process.stdin, process.stdout),
		Script   = require('vm').Script,
		compiler = global.compiler;

	//CLI colors
	var format = {
		BOLD : '\u001b[0;1m',
		GREEN: '\u001b[0;32m',
		RED  : '\u001b[0;31m',
		REDBG: '\u001b[0;41m',
		RESET: '\u001b[0m'
	};

	//Generate AST
	function jsparse() {
		return jspp.narcissus.jsparse.apply(jspp.narcissus, arguments);
	}

	repl.setPrompt('js++> ');
	repl.prompt();

	repl.on('line', function(line) {
		line = line.trim();

		try {
			var c = new compiler(jsparse(line), {
				debug:		false,
				nowrap:		true,
				warnings:	false
			});

			c.preprocess();

			var output = Script.runInNewContext(c.compile(), {});

			console.log(require("util").inspect(output, false, 2, true));
		}
		//Catch compile errors and manually output, highlight, etc.
		catch(e){
			var errorType = e.name,
				errorMsg  = e.message;

			//Display the error message
			console.log(
				'[' + format.RED + errorType + format.RESET + '] ' + errorMsg
			);
		}

		repl.prompt();
	}).on('close', function() {
		process.exit(0);
	});
};