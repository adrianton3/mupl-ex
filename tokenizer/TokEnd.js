"use strict";

function TokEnd() { }

TokEnd.prototype.match = function(that) {
	return that instanceof TokEnd;
}

TokEnd.prototype.toString = function() {
	return "END";
}

TokEnd.prototype.toHTML = function(c) {
	return '';
}