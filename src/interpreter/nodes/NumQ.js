exports.NumQ = (() => {
	'use strict'

	const { Num } = require('./Num.js')
	const { Bool } = require('./Bool.js')

	function NumQ (e) {
		this.e = e
	}

	NumQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		return new Bool(eEv instanceof Num)
	}

	NumQ.prototype.accept = function (visitor, state) {
		return visitor.visitNumQ(this, state)
	}

	NumQ.prototype.toString = function () {
		return '(num? ' + this.e + ')'
	}

	return NumQ
})()
