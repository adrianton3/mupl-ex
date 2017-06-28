exports.Out = (() => {
	'use strict'

	const Out = { }

	Out.s = ''
	Out.reset = function () { Out.s = '' }
	Out.print = function (s) { Out.s += s }
	Out.toString = function () { return Out.s }

	return Out
})()
