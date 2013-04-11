"use strict";

function Closure(env, fun) {
	this.env = env;
	this.fun = fun;
}

Closure.prototype.ev = function(env) {
	return this;
}

Closure.prototype.toString = function() {
	return 'Closure(env: ' + this.env + ', fun: ' + this.fun + ')'; 
}
