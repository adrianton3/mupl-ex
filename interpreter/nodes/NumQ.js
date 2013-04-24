"use strict";

function NumQ(e) {
	this.e = e;
}

NumQ.prototype.ev = function(env) {
	var eEv = this.e.ev(env);
	
	if(eEv instanceof Num) return new Bool(true);
	else return new Bool(false);
}

NumQ.prototype.accept = function(visitor, state) {
	return visitor.visitNumQ(this, state);
}

NumQ.prototype.toString = function() {
	return '(num? ' + this.e + ')';
}