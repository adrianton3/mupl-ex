"use strict";

function Str(s) {
	this.s = s;
}

Str.prototype.ev = function(env, modSet) {
	return this;
}

Str.prototype.accept = function(visitor, state) {
	return visitor.visitStr(this, state);
}

Str.prototype.accept = function(visitor, state) {
	return visitor.visitStr(this, state);
}

Str.prototype.getValue = function() { return this.s; }

Str.prototype.toString = function() {
	return this.s;
}