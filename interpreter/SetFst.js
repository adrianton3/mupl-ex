"use strict";

function SetFst(name, e, body) {
	this.name = name;
	this.e = e;
	this.body = body; 
}

SetFst.prototype.ev = function(env) {
	var eEv = this.e.ev(env);
	var binding = env.getBinding(this.name);
	if(!(binding.v instanceof Pair)) throw 'Cannot setfst on non-pair';
	binding.v.e1 = eEv;
	return this.body.ev(env);
}

SetFst.prototype.toString = function() {
	return '(setfst! ' + this.name + '\n' + this.e + '\n' + this.body + ')';
}