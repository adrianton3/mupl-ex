"use strict";

var exports = { };

function require(s) {
	var lastIndex = s.lastIndexOf('/');
	var name = s.substring(lastIndex + 1, s.length - 3);
	if(!exports[name]) {
		console.warn('Module', name, 'was not exported');
		console.trace();
	}
	var o = {};
	o[name] = exports[name];
	return o;
}