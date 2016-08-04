exports.UnitQ = (function () {
	"use strict"

	var Unit = require('./Unit.js').Unit
	var Bool = require('./Bool.js').Bool

	function UnitQ (e) {
		this.e = e
	}

	UnitQ.prototype.ev = function (env, modSet) {
		var eEv = this.e.ev(env, modSet)

		if (eEv instanceof Unit) return new Bool(true)
		else return new Bool(false)
	}

	UnitQ.prototype.accept = function (visitor, state) {
		return visitor.visitUnitQ(this, state)
	}

	UnitQ.prototype.toString = function () {
		return '(unit? ' + this.e + ')'
	}

	return UnitQ
})()
