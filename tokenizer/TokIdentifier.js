"use strict";

function TokIdentifier(s) {
	this.s = s;
}

TokIdentifier.prototype.match = function(that) {
	return that instanceof TokIdentifier;
}

TokIdentifier.prototype.toString = function() {
	return "Identifier(" + this.s + ")";
}

TokIdentifier.prototype.toHTML = function(c) {
	return '<span style="color:' + c.identifier + '">' + this.s + '</span>';
}