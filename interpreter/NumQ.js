"use strict";

function NumQ(e) {
	this.e = e;
}

NumQ.prototype.ev = function(env) {
	var eEv = this.e.ev(env);
	
	if(eEv instanceof Num) return new Bool(true);
	else return new Bool(false);
}

NumQ.prototype.toString = function() {
	return '(num? ' + this.e + ')';
}