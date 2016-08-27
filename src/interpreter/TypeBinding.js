exports.TypeBinding = (() => {
	'use strict'

	function TypeBinding (s, v, final) {
		this.s = s
		this.v = v
		this.final = final
	}

	TypeBinding.prototype.toString = function () {
		return this.s + (this.final ? ' :: ' : ' *: ') + this.v
	}

	return TypeBinding
})()
