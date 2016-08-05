"use strict"

function callStar (funexp, list) {
	if (list.length > 0) {
		let old = new Call(funexp, list[0])
		for (let i = 1; i < list.length; i++)
			old = new Call(old, list[i])

		return old
	}
	else return new Call(funexp, false)
}
