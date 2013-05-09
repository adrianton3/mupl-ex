"use strict";

function Module(name, defs) {
	this.name = name;
	this.defs = defs;
	this.publicDefs = Module.getPub(defs);
	this.privateEnv = Module.getEnv(defs);
}

Module.getPub = function(defs) {
	var ret = [];
	for(var i in defs)
		if(defs[i].pub)
			ret.push(defs[i]);
	return ret;
}

Module.getEnv = function(defs) {
	var old = Env.Emp;
	for(var i in defs)
		old = old.con(new Binding(defs[i].defName, new Closure(Env.Emp, defs[i].fun)));
	
	return old;
}

Module.prototype.getVal = function(name) {
	for(var i in this.publicDefs)
		if(this.publicDefs[i].defName == name)
			return this.publicDefs[i];
	throw 'Could not find ' + name + ' in module ' + this.name;
}

Module.prototype.accept = function(visitor, state) {
	for(var i in this.defs)
		this.defs[i].accept(visitor, state);
}