exports.Num = (function () {
	"use strict";
	
	function Num(n) {
		this.n = n;
	}
	
	Num.prototype.ev = function(env, modSet) {
		return this;
	}
	
	Num.prototype.accept = function(visitor, state) {
		return visitor.visitNum(this, state);
	}
	
	Num.prototype.accept = function(visitor, state) {
		return visitor.visitNum(this, state);
	}
	
	Num.prototype.getValue = function() { return this.n; }
	
	Num.prototype.toString = function() {
		return this.n.toString();
	}
	
	return Num;
})();
