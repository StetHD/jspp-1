//JavaScript++ Common Distributable File

; (function() {
	var global = this,
		canDefineProperty = typeof Object.defineProperty == "function";

	/**************************** CommonJS Modules ****************************/
	//Don't remove the below var declaration; we need some closure magic to
	//successfully hack together CommonJS modules in the browser (specifically,
	//accessor properties can't have values)
	var exportsObj = {};

	this.module = {
		__LOADED__: [],
		exports: exportsObj
	};
	this.exports = this.module.exports;

	//ES5-compatible browsers can have this hacked in in a more "natural" way
	if (canDefineProperty) {
		Object.defineProperty(this.module, "__LOADED__", {
			value: [],
			writable: false,
			enumerable: false,
			configurable: false
		});

		var exportsSettings = {
			get: function() {
				return exportsObj;
			},
			set: function(code) {
				global.module.__LOADED__.push({
					filename: "",
					source: code
				});

				return {};
			}
		};
		Object.defineProperty(this.module, "exports", exportsSettings);
		Object.defineProperty(this, "exports", exportsSettings);
	}

	//The loading function itself
	function load() {
		if (canDefineProperty) {
			//TODO: script tag
		}
		else {
			//TODO: xhr + eval
			//eval the files in the ORIGINAL order, but load asynchronously
		}
	}

	/**************************** Function Binding ****************************/

	function bind(func, scope) {
		function ret() {
			if (this.constructor === func) return func;
			return func.call(scope || global);
		}

		ret.call = function(scope) {
			var rest = Array.prototype.slice.call(arguments, 1);
			return func.apply(scope || global, rest);
		};

		ret.apply = function(scope, arg) {
			if (Object.prototype.toString.call(arg) != "[object Array]") arg = [];
			return func.apply(scope || global, arg);
		};

		return ret
	}

	/********************************* Mixins *********************************/

	function mixin(source, target) {
		for (var prop in source) {
			if (!(prop in target)) {
				target[prop] = source[prop];
			}
		}

		return target;
	}

	/********************************* Export *********************************/

	var exportJspp = {
		bind: bind,
		load: load,
		mixin: mixin
	};

	if (canDefineProperty) {
		Object.defineProperty(global, "jsppCommon", {
			value: exportJspp,
			writable: false,
			enumerable: false,
			configurable: false
		});
	}
	else {
		global.jsppCommon = exportJspp;
	}
}).call();