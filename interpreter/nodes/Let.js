"use strict";

function Let(name, e, body, final) {
	this.name = name;
	this.e = e;
	this.body = body; 
	this.final = final;
}

Let.prototype.ev = function(env, modSet) {
	var eEv = this.e.ev(env, modSet);
	
	return this.body.ev(env.con(new VarBinding(this.name, eEv, this.final)), modSet);
}

Let.prototype.accept = function(visitor, state) {
	return visitor.visitLet(this, state);
}

Let.prototype.toString = function() {
	return '(let ' + this.name + '\n' + this.e + '\n' + this.body + ')';
}