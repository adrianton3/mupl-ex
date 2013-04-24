"use strict";

function Snd(e) {
	this.e = e; 
}

Snd.prototype.ev = function(env) {
	var ev = this.e.ev(env);
	if(!(ev instanceof Pair))	throw "Can't do snd on non-pairs";
	
	return ev.e2;
}

Snd.prototype.accept = function(visitor, state) {
	return visitor.visitSnd(this, state);
}

Snd.prototype.toString = function() {
	return '(snd ' + this.e + ')';
}