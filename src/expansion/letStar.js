"use strict"

function letStar (list, body) {
	let old = body
	for (let i = list.length - 1; i >= 0; i--)
		old = new Let(list[i].name, list[i].exp, old, true)

	return old
}

function LetStarPair (name, exp) {
	this.name = name
	this.exp = exp
}
