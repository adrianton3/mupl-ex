"use strict";

function Bool(v) {
	this.v = v;
}

Bool.prototype.ev = function(env) {
	return this;
}

Bool.prototype.accept = function(visitor, state) {
	return visitor.visitBool(this, state);
}

Bool.prototype.toString = function() {
	if(this.v) return '#t';
	else return '#f';
}