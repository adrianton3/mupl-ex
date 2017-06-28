exports.SetFst = (() => {
	'use strict'

	const { Pair } = require('./Pair.js')

	function SetFst (name, e, body, tokenCoords) {
		this.name = name
		this.e = e
		this.body = body
		this.tokenCoords = tokenCoords
	}

	SetFst.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)
		const binding = env.getBinding(this.name)

		if (!(binding.v instanceof Pair)) {
			throw 'Cannot apply setfst! on non-pair'
		}

		binding.v.e1 = eEv

		return this.body.ev(env, modSet)
	}

	SetFst.prototype.accept = function (visitor, state) {
		return visitor.visitSetFst(this, state)
	}

	SetFst.prototype.toString = function () {
		return '(setfst! ' + this.name + '\n' + this.e + '\n' + this.body + ')'
	}

	return SetFst
})()
