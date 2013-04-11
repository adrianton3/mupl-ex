"use strict";

function Num(n) {
	this.n = n;
}

Num.prototype.ev = function(env) {
	return this;
}

Num.prototype.toString = function() {
	return this.n.toString();
}