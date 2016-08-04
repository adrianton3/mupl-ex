exports.CallJS = (function () {
	"use strict"

	var interjm = require('./interjm.js').interjm
	var TokenCoords = require('../../tokenizer/TokenCoords.js').TokenCoords

	function CallJS (funIdentifier, parameterExps, tokenCoords) {
		this.funIdentifier = funIdentifier
		this.parameterExps = parameterExps
		this.tokenCoords = tokenCoords
	}

	CallJS.prototype.ev = function (env, modSet) {
		var evParamter = this.parameterExps.map(function (parameterExp) {
			return JSON.stringify(interjm.mtojValue(parameterExp.ev(env, modSet)))
		})

		var parameterExpsStr = '(' + evParamter.join(', ') + ')'
		var completeEvalStr = this.funIdentifier + parameterExpsStr

		var callEv = eval(completeEvalStr)
		var convertedValue = interjm.jtomValue(callEv)

		if (convertedValue !== undefined) {
			return convertedValue
		}
		throw 'Expression of unknown type returned by calljs'
	}

	CallJS.prototype.accept = function (visitor, state) {
		return visitor.visitCallJS(this, state)
	}

	CallJS.prototype.toString = function () {
		return '(calljs ' + this.funexp + '\n' + this.pexp + ')'
	}

	return CallJS
})()
