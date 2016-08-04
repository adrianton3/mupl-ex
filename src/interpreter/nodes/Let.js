exports.Let = (function () {
	"use strict"

	var VarBinding = require('../VarBinding.js').VarBinding
	var TokenCoords = require('../../tokenizer/TokenCoords.js').TokenCoords

	function Let (name, e, body, final, tokenCoords) {
		this.name = name
		this.e = e
		this.body = body
		this.final = final
		this.tokenCoords = tokenCoords
	}

	Let.prototype.ev = function (env, modSet) {
		var eEv = this.e.ev(env, modSet)

		return this.body.ev(env.con(new VarBinding(this.name, eEv, this.final)), modSet)
	}

	Let.prototype.accept = function (visitor, state) {
		return visitor.visitLet(this, state)
	}

	Let.prototype.toString = function () {
		return '(let ' + this.name + '\n' + this.e + '\n' + this.body + ')'
	}

	return Let
})()
