exports.RecordPair = (function () {
	"use strict";
	
	function RecordPair(name, exp) {
		this.name = name;
		this.exp = exp;
	}
	
	RecordPair.prototype.toString = function() {
		return '(' + this.name + ' ' + this.exp + ')';
	}
	
	return RecordPair;
})();