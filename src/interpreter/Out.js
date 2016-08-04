exports.Out = (function () {
	"use strict"

	var Out = { }

	Out.s = ''
	Out.reset = function () { Out.s = '' }
	Out.print = function (s) { Out.s += s }
	Out.toString = function () { return Out.s }

	return Out
})()
