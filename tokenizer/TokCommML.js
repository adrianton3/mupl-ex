"use strict";

function TokCommML(s) {
	this.s = s;
}

TokCommML.prototype.toString = function() {
	return "CommML(" + this.s + ")";
}

TokCommML.prototype.toHTML = function(c) {
	return '<span style="color:' + c.commML + '">' + this.s + '</span>';
}