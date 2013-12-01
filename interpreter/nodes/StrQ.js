exports.StrQ = (function () {
	"use strict";
	
	var Str = require('./Str.js').Str;
	var Bool = require('./Bool.js').Bool;
	
	function StrQ(e) {
		this.e = e;
	}
	
	StrQ.prototype.ev = function(env, modSet) {
		var eEv = this.e.ev(env, modSet);
		
		if(eEv instanceof Str) return new Bool(true);
		else return new Bool(false);
	};
	
	StrQ.prototype.accept = function(visitor, state) {
		return visitor.visitStrQ(this, state);
	};
	
	StrQ.prototype.toString = function() {
		return '(string? ' + this.e + ')';
	};
	
	return StrQ;
})();
