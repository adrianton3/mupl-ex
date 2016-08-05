exports.BoolQ = (function () {
	"use strict"

	const Bool = require('./Bool.js').Bool

	function BoolQ (e) {
		this.e = e
	}

	BoolQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		if (eEv instanceof Bool) return new Bool(true)
		else return new Bool(false)
	}

	BoolQ.prototype.accept = function (visitor, state) {
		return visitor.visitBoolQ(this, state)
	}

	BoolQ.prototype.toString = function () {
		return '(bool? ' + this.e + ')'
	}

	return BoolQ
})()
