"use strict";

function Xor(e1, e2) {
	this.e1 = e1;
	this.e2 = e2; 
}

Xor.prototype.ev = function(env) {
	var e1Ev = this.e1.ev(env);
	if(!(e1Ev instanceof Bool)) throw "Can not perform xor on non-booleans";
	
	var e2Ev = this.e2.ev(env);
	if(!(e2Ev instanceof Bool)) throw "Can not perform xor on non-booleans";
	
	if(e1Ev.v ? (!e2Ev.v) : e2Ev.v) return new Bool(true);
	else return new Bool(false);
}

Xor.prototype.toString = function() {
	return '(xor ' + this.e1 + ' ' + this.e2 + ')';
}