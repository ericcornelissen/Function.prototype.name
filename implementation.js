'use strict';

var IsCallable = require('is-callable');
var hasOwn = require('hasown');
var functionsHaveNames = require('functions-have-names')();
var $TypeError = require('es-errors/type');
var callBound = require('call-bound');

var $functionToString = callBound('Function.prototype.toString');
var $stringMatch = callBound('String.prototype.match');
var toStr = callBound('Object.prototype.toString');

var classRegex = /^class /;

/** @param {unknown} fn */
var isClass = function isClassConstructor(fn) {
	if (IsCallable(fn)) {
		return false;
	}
	if (typeof fn !== 'function') {
		return false;
	}
	try {
		var match = $stringMatch($functionToString(fn), classRegex);
		return !!match;
	} catch (e) {}
	return false;
};

var regex = /\s*function\s+([^(\s]*)\s*/;

var isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays

var objectClass = '[object Object]';
var ddaClass = '[object HTMLAllCollection]';

var functionProto = Function.prototype;

/** @type {(() => false) | ((value: unknown) => value is HTMLAllCollection)} */
var isDDA = function isDocumentDotAll() {
	return /** @type {const} */ (false);
};
if (typeof document === 'object') {
	// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
	var all = document.all;
	if (toStr(all) === toStr(document.all)) {
		isDDA = /** @type {(value: unknown) => value is HTMLAllCollection} */ function isDocumentDotAll(value) {
			/* globals document: false */
			// in IE 6-8, typeof document.all is "object" and it's truthy
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					// @ts-expect-error nullish will throw
					var str = toStr(value);
					// IE 6-8 uses `objectClass`
					return (str === ddaClass || str === objectClass)
						&& /** @type {Function} */ (value)('') == null;
				} catch (e) { /**/ }
			}
			return false;
		};
	}
}

/** @type {import('./implementation')} */
module.exports = function getName() {
	if (isDDA(this) || (!isClass(this) && !IsCallable(this))) {
		throw new $TypeError('Function.prototype.name sham getter called on non-function');
	}
	if (functionsHaveNames && hasOwn(this, 'name')) {
		return this.name;
	}
	if (this === functionProto) {
		return '';
	}
	var str = $functionToString(this);
	var match = $stringMatch(str, regex);
	var name = match && match[1];

	return /** @type {string} */ (name);
};
