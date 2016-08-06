exports.Deref = (function () {
	"use strict"

	const Record = require('./Record.js').Record

	function Deref (exp, name, tokenCoords) {
		this.exp = exp
		this.name = name
		this.tokenCoords = tokenCoords
	}

	Deref.prototype.accept = function (visitor, state) {
		return visitor.visitDeref(this, state)
	}

	Deref.prototype.ev = function (env, modSet) {
		const expEv = this.exp.ev(env, modSet)

		if (!(expEv instanceof Record)) {
			throw 'Can not dereferentiate a non-record ' + this.tokenCoords
		}

		return expEv.get(this.name)
	}

	return Deref
})()
