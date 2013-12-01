exports.TokBool = (function () {
	"use strict";
	
	function TokBool(s, coords) {
		this.s = s;
		this.coords = coords;
	}
	
	TokBool.prototype.match = function(that) {
		return that instanceof TokBool;
	}
	
	TokBool.prototype.toString = function() {
		return "Bool(" + this.s + ")";
	}
	
	TokBool.prototype.toHTML = function(c) {
		return '<span style="color:' + c.keyword + '">' + this.s + '</span>';
	}
	
	return TokBool;
})();
