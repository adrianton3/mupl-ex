"use strict";

function Print(e, body) {
	this.e = e;
	this.body = body; 
}

Print.prototype.ev = function(env) {
	Out.print(this.e.ev(env));
	return this.body.ev(env);
}

Print.prototype.toString = function() {
	return '(print ' + this.e + '\n' + this.body + ')';
}