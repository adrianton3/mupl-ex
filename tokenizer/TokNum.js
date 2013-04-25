"use strict";

function TokNum(s) {
	this.n = parseFloat(s);
}

TokNum.prototype.match = function(that) {
	return that instanceof TokNum;
}

TokNum.prototype.toString = function() {
	return "Num(" + this.n + ")";
}

TokNum.prototype.toHTML = function(c) {
	return '<span style="color:' + c.num + '">' + this.n + '</span>';
}