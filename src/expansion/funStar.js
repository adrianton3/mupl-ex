"use strict"

function funStar (name, list, body) {
	let old = body

	if (list.length === 0) {
		return new Fun(name, false, old)
	} else {
		for (let i = list.length - 1; i > 0; i--) {
			old = new Fun(false, list[i], old)
		}

		return new Fun(name, list[0], old)
	}
}
