"use strict";

function Fst(e, tokenCoords) {
	this.e = e; 
	this.tokenCoords = tokenCoords;
}

Fst.prototype.ev = function(env, modSet) {
	var ev = this.e.ev(env, modSet);
	if(!(ev instanceof Pair))	throw 'Can not get first member of on non-pair ' + this.tokenCoords;
	
	return ev.e1;
}

Fst.prototype.accept = function(visitor, state) {
	return visitor.visitFst(this, state);
}

Fst.prototype.toString = function() {
	return '(fst ' + this.e + ')';
}