exports.ModuleSet = (function () {
	"use strict";
	
	function ModuleSet(mods) {
		this.mods = mods;
	}
	
	ModuleSet.getEmp = function() {
		return new ModuleSet([]);
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
		return visitor.visitModuleSet(this, state);
	}
	
	return ModuleSet;
})();
