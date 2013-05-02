"use strict";

function Set(name, e, body) {
	this.name = name;
	this.e = e;
	this.body = body; 
}

Set.prototype.ev = function(env, modSet) {
	var eEv = this.e.ev(env, modSet);
	env.setBinding(this.name, eEv);
	return this.body.ev(env, modSet);
}

Set.prototype.accept = function(visitor, state) {
	return visitor.visitSet(this, state);
}

Set.prototype.toString = function() {
	return '(set! ' + this.name + '\n' + this.e + '\n' + this.body + ')';
}