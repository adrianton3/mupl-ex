"use strict";

function Unit() {
	
}

Unit.prototype.ev = function(env) {
	return this;
}

Unit.prototype.accept = function(visitor, state) {
	return visitor.visitUnit(this, state);
}

Unit.prototype.toString = function() {
	return 'unit';
}