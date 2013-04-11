"use strict";

function If(cond, e1, e2) {
	this.cond = cond;
	this.e1 = e1;
	this.e2 = e2;
}

If.prototype.ev = function(env) {
	var condEv = this.cond.ev(env);
	if(!(condEv instanceof Bool)) throw 'if condition needs to be a boolean'; 
	
	if(condEv.v) return this.e1.ev(env);
	else return this.e2.ev(env);
}

If.prototype.toString = function() {
	return '(if ' + this.cond + '\n' + this.e1 + '\n' + this.e2 + ')';
}
