function TokLPar() {
	
}

TokLPar.prototype.match = function(that) {
	return that instanceof TokLPar;
}

TokLPar.prototype.toString = function() {
	return "LPar";
}

TokLPar.prototype.toHTML = function(c) {
	return '<span style="color:' + c.par + '">(</span>';
}