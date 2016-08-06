exports.VarBinding = (function () {
	"use strict"

	function VarBinding (s, v, final) {
		this.s = s
		this.v = v
		this.final = final
	}

	VarBinding.prototype.set = function (nv) {
		if (this.final) {
		    throw this.s + ' is final'
        } else {
            this.v = nv
        }
	}

	VarBinding.prototype.toString = function () {
        return this.s + (this.final ? ' := ' : ' *= ') + this.v
	}

	return VarBinding
})()
