"use strict";

function funStar(name, list, body) {
	var old = body;
	for(var i = list.length - 1; i > 0; i--)
		old = new Fun(false, list[i], old);
		
	old = new Fun(name, list[0], old);
	
	return old;
}