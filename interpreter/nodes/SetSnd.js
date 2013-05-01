"use strict";

function SetSnd(name, e, body) {
	this.name = name;
	this.e = e;
	this.body = body; 
}

SetSnd.prototype.ev = function(env, modSet) {
	var eEv = this.e.ev(env, modSet);
	var binding = env.getBinding(this.name);
	if(!(binding.v instanceof Pair)) throw 'Cannot setsnd on non-pair';
	binding.v.e2 = eEv;
	return this.body.ev(env, modSet);
}

SetSnd.prototype.accept = function(visitor, state) {
	return visitor.visitSetSnd(this, state);
}

SetSnd.prototype.toString = function() {
	return '(setsnd! ' + this.name + '\n' + this.e + '\n' + this.body + ')';
}