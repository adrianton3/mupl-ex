exports.Any = (function () {
	"use strict"

	function Any () {}

	Any.prototype.ev = function (env, modSet) {
		return this
	}

	Any.prototype.accept = function (visitor, state) {
		return visitor.visitAny(this, state)
	}

	Any.prototype.toString = function () {
		return 'any'
	}

	return Any
})()
