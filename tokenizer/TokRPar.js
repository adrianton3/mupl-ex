function TokRPar() {
	
}

TokRPar.prototype.match = function(that) {
	return that instanceof TokRPar;
}

TokRPar.prototype.toString = function() {
	return "RPar";
}

TokRPar.prototype.toHTML = function(c) {
	return '<span style="color:' + c.par + '">)</span>';
}