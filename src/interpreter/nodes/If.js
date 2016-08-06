exports.If = (function () {
	"use strict"

	const Bool = require('./Bool.js').Bool

	function If (cond, e1, e2, tokenCoords) {
		this.cond = cond
		this.e1 = e1
		this.e2 = e2
		this.tokenCoords = tokenCoords
	}

	If.prototype.ev = function (env, modSet) {
		const condEv = this.cond.ev(env, modSet)
		if (!(condEv instanceof Bool)) {
			throw 'If condition needs to be a boolean ' + this.tokenCoords
		}

		return condEv.v ?
			this.e1.ev(env, modSet) :
			this.e2.ev(env, modSet)
	}

	If.prototype.accept = function (visitor, state) {
		return visitor.visitIf(this, state)
	}

	If.prototype.toString = function () {
		return '(if ' + this.cond + '\n' + this.e1 + '\n' + this.e2 + ')'
	}

	return If
})()
