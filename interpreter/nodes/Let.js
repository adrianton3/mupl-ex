"use strict";

function Let(name, e, body) {
	this.name = name;
	this.e = e;
	this.body = body; 
}

Let.prototype.ev = function(env, modSet) {
	var eEv = this.e.ev(env, modSet);
	
	return this.body.ev(env.con(new Binding(this.name, eEv)), modSet);
}

Let.prototype.compFreeVar = function(outSet, ownSet) {
	var nOwnSet = ownSet.add(this.name);

	return this.e.compFreeVar().union(this.body.compFreeVar());
}

Let.prototype.accept = function(visitor, state) {
	return visitor.visitLet(this, state);
}

Let.prototype.toString = function() {
	return '(let ' + this.name + '\n' + this.e + '\n' + this.body + ')';
}