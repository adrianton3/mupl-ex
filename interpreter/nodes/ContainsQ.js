"use strict";

function ContainsQ(exp, list) {
	this.exp = exp;
	this.list = list;
}

ContainsQ.prototype.ev = function(env) {
	var expEv = this.exp.ev(env);
	
	if(!(expEv instanceof Record)) throw 'Can not apply contains? to a non-record';
	
	//TODO: optimize this
	for(i in this.list)
		if(!expEv.contains(this.list[i])) return new Bool(false);
	
	return new Bool(true);
}

ContainsQ.prototype.accept = function(visitor, state) {
	return visitor.visitContainsQ(this, state);
}

ContainsQ.prototype.toString = function() {
	return '(contains? ' + this.exp + ' ' + this.name + ')';
}