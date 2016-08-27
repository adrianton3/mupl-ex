exports.Var = (() => {
	'use strict'

	function Var (name, tokenCoords) {
		this.name = name
		this.extern = this.name.indexOf('.') !== -1
		this.tokenCoords = tokenCoords
	}

	Var.prototype.ev = function (env, modSet) {
		return this.extern ?
			modSet.getVal(this.name) :
			env.findBinding(this.name)
	}

	Var.prototype.accept = function (visitor, state) {
		return visitor.visitVar(this, state)
	}

	Var.prototype.toString = function () {
		return '(var ' + this.name + ')'
	}

	return Var
})()
