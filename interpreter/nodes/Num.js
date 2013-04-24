"use strict";

function Num(n) {
	this.n = n;
}

Num.prototype.ev = function(env) {
	return this;
}

Num.prototype.accept = function(visitor, state) {
	return visitor.visitNum(this, state);
}

Num.prototype.accept = function(visitor, state) {
	return visitor.visitNum(this, state);
}

Num.prototype.toString = function() {
	return this.n.toString();
}