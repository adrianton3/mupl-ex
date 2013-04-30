"use strict";

function Var(name) {
	this.name = name;
	this.extern = this.name.indexOf('.') != -1;	
}

Var.prototype.ev = function(env) {
	if(this.extern) return _M.getVal(this.name);
	else return env.findBinding(this.name);
}

Var.prototype.compFreeVar = function(outSet, ownSet) {
	if(ownSet.contains(this.name)) return NulElem;
	else if(outSet.contains(this.name)) return new Elem(this.name);
	else throw 'Variable ' + this.name + ' not in env';
}

Var.prototype.accept = function(visitor, state) {
	return visitor.visitVar(this, state);
}

Var.prototype.toString = function() {
	return '(var ' + this.name + ')';
}