"use strict";

function Fst(e) {
	this.e = e; 
}

Fst.prototype.ev = function(env) {
	var ev = this.e.ev(env);
	if(!(ev instanceof Pair))	throw "Can't do fst on non-pairs";
	
	return ev.e1;
}

Fst.prototype.toString = function() {
	return '(fst ' + this.e + ')';
}