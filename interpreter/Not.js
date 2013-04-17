"use strict";

function Not(e) {
	this.e = e;
}

Not.prototype.ev = function(env) {
	var eEv = this.e.ev(env);
	
	if(!(eEv instanceof Bool)) throw "Can not perform not on non-booleans";
	return new Bool(!eEv.v);
}

Not.prototype.toString = function() {
	return '(not ' + this.e + ')';
}