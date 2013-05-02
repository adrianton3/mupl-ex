"use strict";

function Fun(name, pformal, body) {
	this.name = name;
	this.pformal = pformal;
	this.body = body;
	this.freeVar = [];
}

Fun.prototype.ev = function(env, modSet) {
	return new Closure(env, this);
}

Fun.prototype.compFreeVar = function(outSet, ownSet) {
	var nOutSet = outSet.union(ownSet);
	var nOwnSet = EmptySet.add(this.pformal);
	this.freeVar = body.compFreeVar(nOutSet, nOwnSet);
	return this.freeVar;
}

Fun.prototype.accept = function(visitor, state) {
	return visitor.visitFun(this, state);
}

Fun.prototype.toString = function() {
	return '(fun ' + this.name + ' ' + this.pformal + '\n' + this.body + ')';
}