"use strict";

function And(e1, e2) {
	this.e1 = e1;
	this.e2 = e2; 
}

And.prototype.ev = function(env, modSet) {
	var e1Ev = this.e1.ev(env, modSet);
	if(!(e1Ev instanceof Bool)) throw "Can not perform and on non-booleans";
	
	if(!e1Ev.v)
		return new Bool(false);
	else {
		var e2Ev = this.e2.ev(env, modSet);
		if(!(e2Ev instanceof Bool)) throw "Can not perform and on non-booleans";
	
		return new Bool(e2Ev.v);
	}
}

And.prototype.accept = function(visitor, state) {
	return visitor.visitAnd(this, state);
}

And.prototype.toString = function() {
	return '(and ' + this.e1 + ' ' + this.e2 + ')';
}