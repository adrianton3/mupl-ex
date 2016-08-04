"use strict";

function cond(list, def) {
	var old = def;
	for(var i = list.length - 1; i >= 0; i--)
		old = new If(list[i].cond, list[i].exp, old);
	
	return old;
}

function CondPair(cond, exp) {
	this.cond = cond;
	this.exp = exp;
}