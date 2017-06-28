exports.Greater = (() => {
	'use strict'

	const { Bool } = require('./Bool.js')
	const { Num } = require('./Num.js')

	function Greater (e1, e2, tokenCoords) {
		this.e1 = e1
		this.e2 = e2
		this.tokenCoords = tokenCoords
	}

	Greater.prototype.ev = function (env, modSet) {
		const e1Ev = this.e1.ev(env, modSet)
		if (!(e1Ev instanceof Num)) {
			throw 'Can not compare non-numbers ' + this.tokenCoords
		}

		const e2Ev = this.e2.ev(env, modSet)
		if (!(e1Ev instanceof Num)) {
			throw 'Can not compare non-numbers ' + this.tokenCoords
		}

		return new Bool(e1Ev.n > e2Ev.n)
	}

	Greater.prototype.accept = function (visitor, state) {
		return visitor.visitGreater(this, state)
	}

	Greater.prototype.toString = function () {
		return '(> ' + this.e1 + ' ' + this.e2 + ')'
	}

	return Greater
})()
