'use strict';

var implementation = require('../implementation');
var callBind = require('call-bind');
var test = require('tape');
var hasStrictMode = require('has-strict-mode')();
var runTests = require('./tests');

test('as a function', function (t) {
	t.test('bad array/this value', { skip: !hasStrictMode }, function (st) {
		/* eslint no-useless-call: 0 */
		st['throws'](function () { implementation.call(undefined); }, TypeError, 'undefined is not an object');
		st['throws'](function () { implementation.call(null); }, TypeError, 'null is not an object');
		st.end();
	});

	var getName = callBind(implementation);

	t.test('pathological function', function (st) {
		var func = eval('(function(){' + new Array(100001).join(' ') + '})'); // eslint-disable-line no-eval
		delete func.name;

		var start = Date.now();
		var result = getName(func);
		var elapsed = Date.now() - start;

		st.equal(result, null, 'anonymous function with no name has the name of null');
		st.ok(elapsed < 250, 'completes in linear time (took ' + elapsed + 'ms)');

		st.end();
	});

	runTests(getName, t);

	t.end();
});
