"use strict"

const exports = { }

function require (s) {
	const lastIndex = s.lastIndexOf('/')
	const name = s.substring(lastIndex + 1, s.length - 3)
	if (!exports[name]) {
		console.warn('Module', name, 'was not exported')
		console.trace()
	}
	const o = {}
	o[name] = exports[name]
	return o
}
