exports.Add = (() => {
	'use strict'

	const { Num } = require('./Num.js')

	function Add (e1, e2, tokenCoords) {
		this.e1 = e1
		this.e2 = e2
		this.tokenCoords = tokenCoords
	}

	Add.prototype.ev = function (env, modSet) {
		const e1Ev = this.e1.ev(env, modSet)

		if (!(e1Ev instanceof Num)) {
			throw 'First argument of addition is not a number ' + this.tokenCoords
		}

		const e2Ev = this.e2.ev(env, modSet)
		if (!(e2Ev instanceof Num)) {
			throw 'Second argument of addition is not a number ' + this.tokenCoords
		}

		return new Num(e1Ev.n + e2Ev.n)
	}

	Add.prototype.accept = function (visitor, state) {
		return visitor.visitAdd(this, state)
	}

	Add.prototype.toString = function () {
		return '(+ ' + this.e1 + ' ' + this.e2 + ')'
	}

	return Add
})()
