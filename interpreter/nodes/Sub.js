"use strict";

function Sub(e1, e2) {
	this.e1 = e1;
	this.e2 = e2; 
}

Sub.prototype.ev = function(env) {
	var e1Ev = this.e1.ev(env);
	if(!(e1Ev instanceof Num)) throw "Can not subtract non-numbers";
	
	var e2Ev = this.e2.ev(env);
	if(!(e2Ev instanceof Num)) throw "Can not subtract non-numbers";
	
	return new Num(e1Ev.n - e2Ev.n);
}

Sub.prototype.accept = function(visitor, state) {
	return visitor.visitSub(this, state);
}

Sub.prototype.toString = function() {
	return '(- ' + this.e1 + ' ' + this.e2 + ')';
}