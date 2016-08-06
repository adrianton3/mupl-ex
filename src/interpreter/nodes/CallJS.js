exports.CallJS = (function () {
	"use strict"

	const interjm = require('./interjm.js').interjm

	function CallJS (funIdentifier, parameterExps, tokenCoords) {
		this.funIdentifier = funIdentifier
		this.parameterExps = parameterExps
		this.tokenCoords = tokenCoords
	}

	CallJS.prototype.ev = function (env, modSet) {
		const evParamter = this.parameterExps.map(function (parameterExp) {
			return JSON.stringify(interjm.mtojValue(parameterExp.ev(env, modSet)))
		})

		const parameterExpsStr = '(' + evParamter.join(', ') + ')'
		const completeEvalStr = this.funIdentifier + parameterExpsStr

		const callEv = eval(completeEvalStr)
		const convertedValue = interjm.jtomValue(callEv)

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
