"use strict"

function letStar (list, body) {
	var old = body
	for (var i = list.length - 1; i >= 0; i--)
		old = new Let(list[i].name, list[i].exp, old, true)

	return old
}

function LetStarPair (name, exp) {
	this.name = name
	this.exp = exp
}
