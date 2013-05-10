"use strict";

function Var(name) {
	this.name = name;
	this.extern = this.name.indexOf('.') != -1;	
}

Var.prototype.ev = function(env, modSet) {
	if(this.extern) return modSet.getVal(this.name);
	else return env.findBinding(this.name);
}

Var.prototype.accept = function(visitor, state) {
	return visitor.visitVar(this, state);
}

Var.prototype.toString = function() {
	return '(var ' + this.name + ')';
}