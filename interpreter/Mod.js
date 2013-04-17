"use strict";

function Mod(e1, e2) {
	this.e1 = e1;
	this.e2 = e2; 
}

Mod.prototype.ev = function(env) {
	var e1Ev = this.e1.ev(env);
	if(!(e1Ev instanceof Num)) throw "Can not compute modulus of non-numbers";
	
	var e2Ev = this.e2.ev(env);
	if(!(e2Ev instanceof Num)) throw "Can not compute modulus of non-numbers";
	
	return new Num(e1Ev.n % e2Ev.n);
}

Mod.prototype.toString = function() {
	return '(% ' + this.e1 + ' ' + this.e2 + ')';
}