exports.Bool = (() => {
	'use strict'

	function Bool (v) {
		this.v = v
	}

	Bool.prototype.ev = function (env, modSet) {
		return this
	}

	Bool.prototype.accept = function (visitor, state) {
		return visitor.visitBool(this, state)
	}

	Bool.prototype.getValue = function () { return this.v }

	Bool.prototype.toString = function () {
		return this.v ? '#t' : '#f'
	}

	return Bool
})()
