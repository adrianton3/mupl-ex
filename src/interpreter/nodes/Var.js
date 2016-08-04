exports.Var = (function () {
	"use strict"

	var TokenCoords = require('../../tokenizer/TokenCoords.js').TokenCoords

	function Var (name, tokenCoords) {
		this.name = name
		this.extern = this.name.indexOf('.') != -1
		this.tokenCoords = tokenCoords
	}

	Var.prototype.ev = function (env, modSet) {
		if (this.extern) return modSet.getVal(this.name)
		else return env.findBinding(this.name)
	}

	Var.prototype.accept = function (visitor, state) {
		return visitor.visitVar(this, state)
	}

	Var.prototype.toString = function () {
		return '(var ' + this.name + ')'
	}

	return Var
})()
