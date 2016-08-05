exports.NumQ = (function () {
	"use strict"

	const Num = require('./Num.js').Num
	const Bool = require('./Bool.js').Bool

	function NumQ (e) {
		this.e = e
	}

	NumQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		if (eEv instanceof Num) return new Bool(true)
		else return new Bool(false)
	}

	NumQ.prototype.accept = function (visitor, state) {
		return visitor.visitNumQ(this, state)
	}

	NumQ.prototype.toString = function () {
		return '(num? ' + this.e + ')'
	}

	return NumQ
})()
