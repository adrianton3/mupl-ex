"use strict";

function ClosureQ(e) {
	this.e = e;
}

ClosureQ.prototype.ev = function(env) {
	var eEv = this.e.ev(env);
	
	if(eEv instanceof Closure) return new Bool(true);
	else return new Bool(false);
}

ClosureQ.prototype.accept = function(visitor, state) {
	return visitor.visitClosureQ(this, state);
}

ClosureQ.prototype.toString = function() {
	return '(closure? ' + this.e + ')';
}