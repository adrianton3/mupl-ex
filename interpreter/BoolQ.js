"use strict";

function BoolQ(e) {
	this.e = e;
}

BoolQ.prototype.ev = function(env) {
	var eEv = this.e.ev(env);
	
	if(eEv instanceof Bool) return new Bool(true);
	else return new Bool(false);
}

BoolQ.prototype.toString = function() {
	return '(bool? ' + this.e + ')';
}