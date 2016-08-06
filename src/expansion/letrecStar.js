"use strict"

function letrecStar (list, body) {
	let old = body

	for (let i = list.length - 1; i >= 0; i--) {
		old = new Set(list[i].name, list[i].exp, old, true)
	}

	for (let i = list.length - 1; i >= 0; i--) {
		old = new Let(list[i].name, new Any(), old, true)
	}

	return old
}

function LetrecStarPair (name, exp) {
	this.name = name
	this.exp = exp
}
