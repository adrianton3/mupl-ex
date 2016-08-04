exports.ClosureQ = (function () {
	"use strict"

	var Closure = require('./Closure.js').Closure
	var Bool = require('./Bool.js').Bool

	function ClosureQ (e) {
		this.e = e
	}

	ClosureQ.prototype.ev = function (env, modSet) {
		var eEv = this.e.ev(env, modSet)

		if (eEv instanceof Closure) return new Bool(true)
		else return new Bool(false)
	}

	ClosureQ.prototype.accept = function (visitor, state) {
		return visitor.visitClosureQ(this, state)
	}

	ClosureQ.prototype.toString = function () {
		return '(closure? ' + this.e + ')'
	}

	return ClosureQ
})()
