"use strict";

function SetSnd(name, e, body) {
	this.name = name;
	this.e = e;
	this.body = body; 
}

SetSnd.prototype.ev = function(env) {
	var eEv = this.e.ev(env);
	var binding = env.getBinding(this.name);
	if(!(binding.v instanceof Pair)) throw 'Cannot setsnd on non-pair';
	binding.v.e2 = eEv;
	return this.body.ev(env);
}

SetSnd.prototype.accept = function(visitor, state) {
	return visitor.visitSetSnd(this, state);
}

SetSnd.prototype.toString = function() {
	return '(setsnd! ' + this.name + '\n' + this.e + '\n' + this.body + ')';
}