"use strict";

function Record(map) {
	this.map = map;
}

Record.prototype.ev = function(env) {
	var mapEv = [];
	
	for(var i in this.map)
		mapEv.push(new RecordPair(this.map[i].name, this.map[i].exp.ev(env)));
	
	return new Record(mapEv);
}

Record.prototype.contains = function(name) {
	for(var i in this.map)
		if(this.map[i].name == name)
			return true;
	
	return false;
}

Record.prototype.get = function(name) {
	for(var i in this.map)
		if(this.map[i].name == name)
			return this.map[i].exp;
			
	throw 'Record does not contain ' + name;
}
//=============================================================================
function RecordPair(name, exp) {
	this.name = name;
	this.exp = exp;
}
