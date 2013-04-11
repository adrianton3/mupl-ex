"use strict";

function Var(name) {
	this.name = name;	
}

Var.prototype.ev = function(env) {
	return env.findBinding(this.name);
}

Var.prototype.compFreeVar = function(outSet, ownSet) {
	if(ownSet.contains(this.name))
		return NulElem;
	else if(outSet.contains(this.name))
		return new Elem(this.name);
	else
		throw 'Variable ' + this.name + ' not in env';
}

Var.prototype.toString = function() {
	return '(var ' + this.name + ')';
}