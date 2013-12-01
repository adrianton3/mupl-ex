exports.Deref = (function () {
	"use strict";
	
	var Record = require('./Record.js').Record;
	var TokenCoords = require('../../tokenizer/TokenCoords.js').TokenCoords;
	
	function Deref(exp, name, tokenCoords) {
		this.exp = exp;
		this.name = name;
		this.tokenCoords = tokenCoords;
	}
	
	Deref.prototype.accept = function(visitor, state) {
		return visitor.visitDeref(this, state);
	};
	
	Deref.prototype.ev = function(env, modSet) {
		var expEv = this.exp.ev(env, modSet);
		
		if(!(expEv instanceof Record)) throw 'Can not dereferentiate a non-record ' + this.tokenCoords;
		
		return expEv.get(this.name);
	};
	
	return Deref;
})();
