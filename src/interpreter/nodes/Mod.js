exports.Mod = (function () {
	"use strict"

	const Num = require('./Num.js').Num

	function Mod (e1, e2, tokenCoords) {
		this.e1 = e1
		this.e2 = e2
		this.tokenCoords = tokenCoords
	}

	Mod.prototype.ev = function (env, modSet) {
		const e1Ev = this.e1.ev(env, modSet)
		if (!(e1Ev instanceof Num)) {
			throw 'First argument of modulus is not a number ' + this.tokenCoords
		}

		const e2Ev = this.e2.ev(env, modSet)
		if (!(e2Ev instanceof Num)) {
			throw 'Second argument of modulus is not a number ' + this.tokenCoords
		}

		return new Num(e1Ev.n % e2Ev.n)
	}

	Mod.prototype.accept = function (visitor, state) {
		return visitor.visitMod(this, state)
	}

	Mod.prototype.toString = function () {
		return '(% ' + this.e1 + ' ' + this.e2 + ')'
	}

	return Mod
})()
