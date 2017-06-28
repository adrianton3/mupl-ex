exports.SetSnd = (() => {
	'use strict'

	const { Pair } = require('./Pair.js')

	function SetSnd (name, e, body, tokenCoords) {
		this.name = name
		this.e = e
		this.body = body
		this.tokenCoords = tokenCoords
	}

	SetSnd.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)
		const binding = env.getBinding(this.name)

		if (!(binding.v instanceof Pair)) {
			throw 'Cannot apply setsnd! on non-pair'
		}

		binding.v.e2 = eEv

		return this.body.ev(env, modSet)
	}

	SetSnd.prototype.accept = function (visitor, state) {
		return visitor.visitSetSnd(this, state)
	}

	SetSnd.prototype.toString = function () {
		return '(setsnd! ' + this.name + '\n' + this.e + '\n' + this.body + ')'
	}

	return SetSnd
})()
