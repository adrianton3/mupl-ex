exports.ContainsQ = (function () {
	"use strict";
	
	var Bool = require('./Bool.js').Bool;
	var TokenCoords = require('../../tokenizer/TokenCoords.js').TokenCoords;
	
	function ContainsQ(exp, list, tokenCoords) {
		this.exp = exp;
		this.list = list;
		this.tokenCoords = tokenCoords;
	}
	
	ContainsQ.prototype.ev = function(env, modSet) {
		var expEv = this.exp.ev(env, modSet);
		
		if(!(expEv instanceof Record)) throw 'Can not apply contains? to a non-record ' + this.tokenCoords;
		
		//TODO: optimize this
		for(var i in this.list)
			if(!expEv.contains(this.list[i])) return new Bool(false);
		
		return new Bool(true);
	}
	
	ContainsQ.prototype.accept = function(visitor, state) {
		return visitor.visitContainsQ(this, state);
	}
	
	ContainsQ.prototype.toString = function() {
		return '(contains? ' + this.exp + ' ' + this.name + ')';
	}
	
	return ContainsQ;
})();
