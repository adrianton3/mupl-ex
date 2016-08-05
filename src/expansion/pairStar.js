"use strict"

function pairStar (list) {
	let old = new Unit()
	for (let i = list.length - 1; i >= 0; i--)
		old = new Pair(list[i], old)

	return old
}
