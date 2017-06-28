exports.And = (() => {
	'use strict'

	const { Bool } = require('./Bool.js')

	function And (e1, e2, tokenCoords) {
		this.e1 = e1
		this.e2 = e2
		this.tokenCoords = tokenCoords
	}

	And.prototype.ev = function (env, modSet) {
		const e1Ev = this.e1.ev(env, modSet)
		if (!(e1Ev instanceof Bool)) {
			throw 'First argument of and-op is not a boolean ' + this.tokenCoords
		}

		if (!e1Ev.v) {
			return new Bool(false)
		} else {
			const e2Ev = this.e2.ev(env, modSet)
			if (!(e2Ev instanceof Bool)) {
				throw 'Second argument of and-op is not a boolean ' + this.tokenCoords
			}

			return new Bool(e2Ev.v)
		}
	}

	And.prototype.accept = function (visitor, state) {
		return visitor.visitAnd(this, state)
	}

	And.prototype.toString = function () {
		return '(and ' + this.e1 + ' ' + this.e2 + ')'
	}

	return And
})()
