exports.TypeBinding = (function () {
	"use strict"

	function TypeBinding (s, v, final) {
		this.s = s
		this.v = v
		this.final = final
	}

	TypeBinding.prototype.toString = function () {
		if (this.final) return this.s + ' :: ' + this.v
		else return this.s + ' *: ' + this.v
	}

	return TypeBinding
})()
