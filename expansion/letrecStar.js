"use strict";

function letrecStar(list, body) {
	var old = body;
	
	for(var i = list.length - 1; i >= 0; i--)
		old = new Set(list[i].name, list[i].exp, old, true);
	
	for(var i = list.length - 1; i >= 0; i--)
		old = new Let(list[i].name, new Any(), old, true);
	
	return old;
}

function LetrecStarPair(name, exp) {
	this.name = name;
	this.exp = exp;
}