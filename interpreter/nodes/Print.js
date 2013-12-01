exports.Print = (function () {
	"use strict";
	
	function Print(e, body) {
		this.e = e;
		this.body = body; 
	}
	
	Print.prototype.ev = function(env, modSet) {
		Out.print(this.e.ev(env, modSet));
		return this.body.ev(env, modSet);
	}
	
	Print.prototype.accept = function(visitor, state) {
		return visitor.visitPrint(this, state);
	}
	
	Print.prototype.toString = function() {
		return '(print ' + this.e + '\n' + this.body + ')';
	}
	
	return Print;
})();
