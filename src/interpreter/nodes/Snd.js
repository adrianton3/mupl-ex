exports.Snd = (() => {
	'use strict'

	const { Pair } = require('./Pair.js')

	function Snd (e, tokenCoords) {
		this.e = e
		this.tokenCoords = tokenCoords
	}

	Snd.prototype.ev = function (env, modSet) {
		const ev = this.e.ev(env, modSet)
		if (!(ev instanceof Pair)) {
			throw 'Can not get second member of on non-pair ' + this.tokenCoords
		}

		return ev.e2
	}

	Snd.prototype.accept = function (visitor, state) {
		return visitor.visitSnd(this, state)
	}

	Snd.prototype.toString = function () {
		return '(snd ' + this.e + ')'
	}

	return Snd
})()
