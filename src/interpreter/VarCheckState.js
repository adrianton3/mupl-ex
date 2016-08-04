exports.VarCheckState = (function () {
	"use strict"

	function VarCheckState (env, modSet) {
		this.env = env
		this.modSet = modSet
	}

	VarCheckState.prototype.con = function (b) {
		return new VarCheckState(this.env.con(b), this.modSet)
	}

	return VarCheckState
})()
