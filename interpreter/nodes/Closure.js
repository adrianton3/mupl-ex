exports.Closure = (function () {
	"use strict";
	
	function Closure(env, fun) {
		this.env = env;
		this.fun = fun;
	}
	
	Closure.prototype.ev = function(env, modSet) {
		return this;
	}
	
	Closure.prototype.accept = function(visitor, state) {
		return visitor.visitClosure(this, state);
	}
	
	Closure.prototype.toString = function() {
		return 'Closure(env: ' + this.env + ', fun: ' + this.fun + ')'; 
	}
	
	return Closure;
})();
