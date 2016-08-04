exports.Not = (function () {
	"use strict"

	var Bool = require('./Bool.js').Bool
	var TokenCoords = require('./tokenizer/TokenCoords.js').TokenCoords

	function Not (e, tokenCoords) {
		this.e = e
		this.tokenCoords = tokenCoords
	}

	Not.prototype.ev = function (env, modSet) {
		var eEv = this.e.ev(env, modSet)

		if (!(eEv instanceof Bool)) throw 'Can not perform not-op on non-booleans ' + this.tokenCoords
		return new Bool(!eEv.v)
	}

	Not.prototype.accept = function (visitor, state) {
		return visitor.visitNot(this, state)
	}

	Not.prototype.toString = function () {
		return '(not ' + this.e + ')'
	}

	return Not
})()
