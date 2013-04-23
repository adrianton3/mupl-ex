"use strict";

function Or(e1, e2) {
	this.e1 = e1;
	this.e2 = e2; 
}

Or.prototype.ev = function(env) {
	var e1Ev = this.e1.ev(env);
	if(!(e1Ev instanceof Bool)) throw "Can not perform or on non-booleans";
	
	if(e1Ev.v)
		return new Bool(true);
	else {
		var e2Ev = this.e2.ev(env);
		if(!(e2Ev instanceof Bool)) throw "Can not perform or on non-booleans";
	
		return new Bool(e2Ev.v);
	}
}

Or.prototype.accept = function(visitor, state) {
	return visitor.visitOr(this, state);
}

Or.prototype.toString = function() {
	return '(or ' + this.e1 + ' ' + this.e2 + ')';
}