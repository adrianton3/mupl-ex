"use strict";

function Fun(name, pformal, body) {
	this.name = name;
	this.pformal = pformal;
	this.body = body;
}

Fun.prototype.ev = function(env, modSet) {
	return new Closure(env, this);
}

Fun.prototype.accept = function(visitor, state) {
	return visitor.visitFun(this, state);
}

Fun.prototype.toString = function() {
	return '(fun ' + this.name + ' ' + this.pformal + '\n' + this.body + ')';
}