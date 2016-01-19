var scopesregex = /({[^{}}]*[\n\r]*})/g,
funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
getFunctionArguments = function(code) {
	if (funcarguments.test(code)) {
		var match = funcarguments.exec(code);
		return match[1].replace(/[\s\n\r\t]*/g,'').split(',');
	}
	return [];
};

var inject = function(callback, args, context) {
	var locals = [],
	requiredArguments = getFunctionArguments(callback.toString());
	

	for (var i = 0;i<requiredArguments.length;++i) {
		if (args instanceof Array) {
			for (var j = 0;j<args.length;++j) {
				if (args[j].hasOwnProperty(requiredArguments[i])) {
					locals[i] = args[j][requiredArguments[i]];
				}
			}
		}
		else if (args.hasOwnProperty(requiredArguments[i])) {
			locals[i] = args[requiredArguments[i]];
		}
	}
	
	var injected;
	injected = function() {
		return callback.apply(context||this, locals.concat(Array.prototype.slice.call(arguments)));
	}
	injected.$$injected = true;
	return injected;
};

module.exports = {
	inject: inject
};