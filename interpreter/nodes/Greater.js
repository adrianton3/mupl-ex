"use strict";

function Greater(e1, e2, tokenCoords) {
	this.e1 = e1;
	this.e2 = e2;
	this.tokenCoords = tokenCoords;
}

Greater.prototype.ev = function(env, modSet) {
	var e1Ev = this.e1.ev(env, modSet);
	if(!(e1Ev instanceof Num)) throw 'Can not compare non-numbers ' + this.tokenCoords;
	
	var e2Ev = this.e2.ev(env, modSet);
	if(!(e1Ev instanceof Num)) throw 'Can not compare non-numbers ' + this.tokenCoords;
	
	if(e1Ev.n > e2Ev.n) return new Bool(true);
	else return new Bool(false);
}

Greater.prototype.accept = function(visitor, state) {
	return visitor.visitGreater(this, state);
}

Greater.prototype.toString = function() {
	return '(> ' + this.e1 + ' ' + this.e2 + ')';
}