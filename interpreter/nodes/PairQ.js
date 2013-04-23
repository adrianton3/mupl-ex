"use strict";

function PairQ(e) {
	this.e = e;
}

PairQ.prototype.ev = function(env) {
	var eEv = this.e.ev(env);
	
	if(eEv instanceof Pair) return new Bool(true);
	else return new Bool(false);
}

PairQ.prototype.accept = function(visitor, state) {
	return visitor.visitPairQ(this, state);
}

PairQ.prototype.toString = function() {
	return '(pair? ' + this.e + ')';
}