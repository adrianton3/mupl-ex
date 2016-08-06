exports.UnitQ = (function () {
	"use strict"

	const Unit = require('./Unit.js').Unit
	const Bool = require('./Bool.js').Bool

	function UnitQ (e) {
		this.e = e
	}

	UnitQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		return new Bool(eEv instanceof Unit)
	}

	UnitQ.prototype.accept = function (visitor, state) {
		return visitor.visitUnitQ(this, state)
	}

	UnitQ.prototype.toString = function () {
		return '(unit? ' + this.e + ')'
	}

	return UnitQ
})()
