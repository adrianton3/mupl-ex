exports.ArrJS = (function () {
	"use strict"

	const interjm = require('./interjm.js').interjm
	const TokenCoords = require('../../tokenizer/TokenCoords.js').TokenCoords

	function ArrJS (arrIdentifier, indexExps, tokenCoords) {
		this.arrIdentifier = arrIdentifier
		this.indexExps = indexExps
		this.tokenCoords = tokenCoords
	}

	ArrJS.prototype.ev = function (env, modSet) {
		const evIndex = this.indexExps.map(function (indexExp) {
			return JSON.stringify(interjm.mtojValue(indexExp.ev(env, modSet)))
		})

		const indexExpsStr = '[' + evIndex.join('][') + ']'
		const completeEvalStr = this.arrIdentifier + indexExpsStr

		const arrEv = eval(completeEvalStr)
		const convertedValue = interjm.jtomValue(arrEv)

		if (convertedValue !== undefined) {
			return convertedValue
		}
		throw 'Expression of unknown type returned by arjs'
	}

	ArrJS.prototype.accept = function (visitor, state) {
		return visitor.visitArrJS(this, state)
	}

	ArrJS.prototype.toString = function () {
		return '(calljs ' + this.funexp + '\n' + this.pexp + ')'
	}

	return ArrJS
})()
