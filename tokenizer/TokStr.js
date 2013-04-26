"use strict";

function TokStr(s) {
	this.s = s;
}

TokStr.prototype.match = function(that) {
	return that instanceof TokStr;
}

TokStr.prototype.toString = function() {
	return "Str(" + this.s + ")";
}

TokStr.prototype.toHTML = function(c) {
	return '<span style="color:' + c.str + '">' + this.s + '</span>';
}