exports.ClosureQ = (() => {
	'use strict'

	const Closure = require('./Closure.js').Closure
	const Bool = require('./Bool.js').Bool

	function ClosureQ (e) {
		this.e = e
	}

	ClosureQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		return new Bool(eEv instanceof Closure)
	}

	ClosureQ.prototype.accept = function (visitor, state) {
		return visitor.visitClosureQ(this, state)
	}

	ClosureQ.prototype.toString = function () {
		return '(closure? ' + this.e + ')'
	}

	return ClosureQ
})()
