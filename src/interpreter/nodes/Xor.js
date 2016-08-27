exports.Xor = (() => {
	'use strict'

	const Bool = require('./Bool.js').Bool

	function Xor (e1, e2, tokenCoords) {
		this.e1 = e1
		this.e2 = e2
		this.tokenCoords = tokenCoords
	}

	Xor.prototype.ev = function (env, modSet) {
		const e1Ev = this.e1.ev(env, modSet)
		if (!(e1Ev instanceof Bool)) {
			throw 'First argument of xor-op is not a boolean ' + this.tokenCoords
		}

		const e2Ev = this.e2.ev(env, modSet)
		if (!(e2Ev instanceof Bool)) {
			throw 'Second argument of xor-op is not a boolean ' + this.tokenCoords
		}

		return new Bool(e1Ev.v ? (!e2Ev.v) : e2Ev.v)
	}

	Xor.prototype.accept = function (visitor, state) {
		return visitor.visitXor(this, state)
	}

	Xor.prototype.toString = function () {
		return '(xor ' + this.e1 + ' ' + this.e2 + ')'
	}

	return Xor
})()
