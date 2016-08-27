exports.Or = (() => {
	'use strict'

	const Bool = require('./Bool.js').Bool

	function Or (e1, e2, tokenCoords) {
		this.e1 = e1
		this.e2 = e2
		this.tokenCoords = tokenCoords
	}

	Or.prototype.ev = function (env, modSet) {
		const e1Ev = this.e1.ev(env, modSet)
		if (!(e1Ev instanceof Bool)) {
			throw 'First argument of or-op is not a boolean ' + this.tokenCoords
		}

		if (e1Ev.v) {
			return new Bool(true)
		} else {
			const e2Ev = this.e2.ev(env, modSet)
			if (!(e2Ev instanceof Bool)) {
				throw 'Second argument of or-op is not a boolean ' + this.tokenCoords
			}

			return new Bool(e2Ev.v)
		}
	}

	Or.prototype.accept = function (visitor, state) {
		return visitor.visitOr(this, state)
	}

	Or.prototype.toString = function () {
		return '(or ' + this.e1 + ' ' + this.e2 + ')'
	}

	return Or
})()
