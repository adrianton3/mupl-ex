"use strict";

function Set(name, e, body) {
	this.name = name;
	this.e = e;
	this.body = body; 
}

Set.prototype.ev = function(env) {
	var eEv = this.e.ev(env);
	env.setBinding(this.name, eEv);
	return this.body.ev(env);
}

Set.prototype.accept = function(visitor, state) {
	return visitor.visitSet(this, state);
}

Set.prototype.toString = function() {
	return '(set! ' + this.name + '\n' + this.e + '\n' + this.body + ')';
}