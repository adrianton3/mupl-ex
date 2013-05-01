"use strict";

function Deref(exp, name) {
	this.exp = exp;
	this.name = name;
}

Deref.prototype.accept = function(visitor, state) {
	return visitor.visitDeref(this, state);
}

Deref.prototype.ev = function(env, modSet) {
	var expEv = this.exp.ev(env, modSet);
	
	if(!(expEv instanceof Record)) throw 'Can not dereferentiate a non-record';
	
	return expEv.get(this.name);
}