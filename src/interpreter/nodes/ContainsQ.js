exports.ContainsQ = (() => {
	'use strict'

	const { Bool } = require('./Bool.js')
	const { Record } = require('./Bool.js')

	function ContainsQ (exp, list, tokenCoords) {
		this.exp = exp
		this.list = list
		this.tokenCoords = tokenCoords
	}

	ContainsQ.prototype.ev = function (env, modSet) {
		const expEv = this.exp.ev(env, modSet)

		if (!(expEv instanceof Record)) {
			throw 'Can not apply contains? to a non-record ' + this.tokenCoords
		}

		return new Bool(
			this.list.every(
				(item) => expEv.contains(item)
			)
		)
	}

	ContainsQ.prototype.accept = function (visitor, state) {
		return visitor.visitContainsQ(this, state)
	}

	ContainsQ.prototype.toString = function () {
		return '(contains? ' + this.exp + ' ' + this.name + ')'
	}

	return ContainsQ
})()
