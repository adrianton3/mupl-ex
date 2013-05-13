"use strict";

function Def(defName, modName, pub, fun, tokenCoords) {
	this.defName = defName;
	this.modName = modName;
	this.pub = pub;
	this.fun = fun;
	this.tokenCoords = tokenCoords;
}

Def.prototype.ev = function(env, modSet) {
	return this;
}

Def.prototype.accept = function(visitor, state) {
	return visitor.visitDef(this, state);
}

Def.prototype.toString = function() {
	return 'Def(env: ' + this.env + ', fun: ' + this.fun + ')'; 
}
