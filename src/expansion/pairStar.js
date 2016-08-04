"use strict"

function pairStar (list) {
	var old = new Unit()
	for (var i = list.length - 1; i >= 0; i--)
		old = new Pair(list[i], old)

	return old
}
