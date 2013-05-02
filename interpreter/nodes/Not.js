"use strict";

function Not(e) {
	this.e = e;
}

Not.prototype.ev = function(env, modSet) {
	var eEv = this.e.ev(env, modSet);
	
	if(!(eEv instanceof Bool)) throw "Can not perform not on non-booleans";
	return new Bool(!eEv.v);
}

Not.prototype.accept = function(visitor, state) {
	return visitor.visitNot(this, state);
}

Not.prototype.toString = function() {
	return '(not ' + this.e + ')';
}