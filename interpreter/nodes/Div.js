"use strict";

function Div(e1, e2) {
	this.e1 = e1;
	this.e2 = e2; 
}

Div.prototype.ev = function(env, modSet) {
	var e1Ev = this.e1.ev(env, modSet);
	if(!(e1Ev instanceof Num)) throw "Can not apply division on non-numbers";
	
	var e2Ev = this.e2.ev(env, modSet);
	if(!(e2Ev instanceof Num)) throw "Can not apply division on non-numbers";
	
	return new Num(e1Ev.n / e2Ev.n);
}

Div.prototype.accept = function(visitor, state) {
	return visitor.visitDiv(this, state);
}

Div.prototype.toString = function() {
	return '(/ ' + this.e1 + ' ' + this.e2 + ')';
}