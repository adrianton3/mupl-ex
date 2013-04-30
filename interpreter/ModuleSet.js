"use strict";

function ModuleSet(mods) {
	this.mods = mods;
}

ModuleSet.prototype.getVal = function(name) {
	var sepIndex = name.lastIndexOf('.');
	var modName = name.substring(sepIndex, 0);
	var defName = name.substring(sepIndex + 1);
	
	for(var i in this.mods)
		if(this.mods[i].name == modName)
			return this.mods[i].getVal(defName);
		
	throw 'Module ' + modName + ' is not defined';
}

ModuleSet.prototype.getEnv = function(name) {	
	for(var i in this.mods)
		if(this.mods[i].name == name)
			return this.mods[i].privateEnv;
		
	throw 'Module ' + name + ' is not defined';
}

ModuleSet.prototype.accept = function(visitor, state) {
	for(var i in this.mods)
		this.mods[i].accept(visitor, state);
}

ModuleSet.prototype.acceptVarCheck = function(visitor) {
	for(var i in this.mods) //TODO: rewrite this special case
		this.mods[i].accept(visitor, this.mods[i].privateEnv);
}