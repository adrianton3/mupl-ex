exports.StrQ = (() => {
	'use strict'

	const Str = require('./Str.js').Str
	const Bool = require('./Bool.js').Bool

	function StrQ (e) {
		this.e = e
	}

	StrQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		return new Bool(eEv instanceof Str)
	}

	StrQ.prototype.accept = function (visitor, state) {
		return visitor.visitStrQ(this, state)
	}

	StrQ.prototype.toString = function () {
		return '(string? ' + this.e + ')'
	}

	return StrQ
})()
