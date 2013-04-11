"use strict";

function callStar(funexp, list) {
	var old = new Call(funexp, list[0]);
	for(var i = 1; i < list.length; i++)
		old = new Call(old, list[i]);
	
	return old;
}