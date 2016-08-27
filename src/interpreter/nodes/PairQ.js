exports.PairQ = (() => {
	'use strict'

	const Pair = require('./Pair.js').Pair
	const Bool = require('./Bool.js').Bool

	function PairQ (e) {
		this.e = e
	}

	PairQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		return new Bool(eEv instanceof Pair)
	}

	PairQ.prototype.accept = function (visitor, state) {
		return visitor.visitPairQ(this, state)
	}

	PairQ.prototype.toString = function () {
		return '(pair? ' + this.e + ')'
	}

	return PairQ
})()
