exports.BoolQ = (function () {
	"use strict"

	const Bool = require('./Bool.js').Bool

	function BoolQ (e) {
		this.e = e
	}

	BoolQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		return new Bool(eEv instanceof Bool)
	}

	BoolQ.prototype.accept = function (visitor, state) {
		return visitor.visitBoolQ(this, state)
	}

	BoolQ.prototype.toString = function () {
		return '(bool? ' + this.e + ')'
	}

	return BoolQ
})()
