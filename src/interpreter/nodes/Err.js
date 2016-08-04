exports.Err = (function () {
	"use strict"

	function Err (e) {
		this.e = e
	}

	Err.prototype.ev = function (env, modSet) {
		throw this.e.ev(env, modSet).toString()
		return new Unit() //
	}

	Err.prototype.accept = function (visitor, state) {
		return visitor.visitErr(this, state)
	}

	Err.prototype.toString = function () {
		return '(err ' + this.e + ')'
	}

	return Err
})()
