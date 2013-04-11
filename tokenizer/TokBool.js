function TokBool(s) {
	this.s = s;
}

TokBool.prototype.match = function(that) {
	return that instanceof TokBool;
}

TokBool.prototype.toString = function() {
	return "Bool(" + this.s + ")";
}

TokBool.prototype.toHTML = function(c) {
	return '<span style="color:' + c.keyword + '">' + this.s + '</span>';
}