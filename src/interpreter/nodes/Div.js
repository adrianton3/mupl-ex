exports.Div = (function () {
	"use strict"

	var Num = require('./Num.js').Num
	var TokenCoords = require('../../tokenizer/TokenCoords.js').TokenCoords

	function Div (e1, e2, tokenCoords) {
		this.e1 = e1
		this.e2 = e2
		this.tokenCoords = tokenCoords
	}

	Div.prototype.ev = function (env, modSet) {
		var e1Ev = this.e1.ev(env, modSet)
		if (!(e1Ev instanceof Num)) throw 'First argument of division is not a number ' + this.tokenCoords

		var e2Ev = this.e2.ev(env, modSet)
		if (!(e2Ev instanceof Num)) throw 'Second argument of division is not a number ' + this.tokenCoords

		return new Num(e1Ev.n / e2Ev.n)
	}

	Div.prototype.accept = function (visitor, state) {
		return visitor.visitDiv(this, state)
	}

	Div.prototype.toString = function () {
		return '(/ ' + this.e1 + ' ' + this.e2 + ')'
	}

	return Div
})()
