function TokCommSL(s) {
	this.s = s;
}

TokCommSL.prototype.toString = function() {
	return "CommSL(" + this.s + ")";
}

TokCommSL.prototype.toHTML = function(c) {
	return '<span style="color:' + c.commSL + '">' + this.s + '</span>';
}