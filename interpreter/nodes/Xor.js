exports.Xor = (function () {
	"use strict";
	
	var Bool = require('./Bool.js').Bool;
	var TokenCoords = require('../../tokenizer/TokenCoords.js').TokenCoords;
	
	function Xor(e1, e2, tokenCoords) {
		this.e1 = e1;
		this.e2 = e2; 
		this.tokenCoords = tokenCoords;
	}
	
	Xor.prototype.ev = function(env, modSet) {
		var e1Ev = this.e1.ev(env, modSet);
		if(!(e1Ev instanceof Bool)) throw 'First argument of xor-op is not a boolean ' + this.tokenCoords;
		
		var e2Ev = this.e2.ev(env, modSet);
		if(!(e2Ev instanceof Bool)) throw 'Second argument of xor-op is not a boolean ' + this.tokenCoords;
		
		if(e1Ev.v ? (!e2Ev.v) : e2Ev.v) return new Bool(true);
		else return new Bool(false);
	}
	
	Xor.prototype.accept = function(visitor, state) {
		return visitor.visitXor(this, state);
	}
	
	Xor.prototype.toString = function() {
		return '(xor ' + this.e1 + ' ' + this.e2 + ')';
	}
	
	return Xor;
})();
