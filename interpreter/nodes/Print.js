"use strict";

function Print(e, body) {
	this.e = e;
	this.body = body; 
}

Print.prototype.ev = function(env) {
	Out.print(this.e.ev(env));
	return this.body.ev(env);
}

Print.prototype.accept = function(visitor, state) {
	return visitor.visitPrint(this, state);
}

Print.prototype.toString = function() {
	return '(print ' + this.e + '\n' + this.body + ')';
}