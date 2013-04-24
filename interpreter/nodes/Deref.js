"use strict";

function Deref(exp, name) {
	this.exp = exp;
	this.name = name;
}

Deref.prototype.accept = function(visitor, state) {
	return visitor.visitDeref(this, state);
}

Deref.prototype.ev = function(env) {
	var expEv = this.exp.ev(env);
	
	if(!(expEv instanceof Record)) throw 'Can not dereferentiate a non-record';
	
	return expEv.get(this.name);
}