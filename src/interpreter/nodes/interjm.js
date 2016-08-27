exports.interjm = (() => {
	'use strict'

	const Bool = require('./Bool.js').Bool
	const Num = require('./Num.js').Num
	const Pair = require('./Pair.js').Pair
	const Record = require('./Record.js').Record
	const Str = require('./Str.js').Str

	function interjm () {}

	interjm.jtomValue = function (jValue) {
		if (typeof jValue === "number") {
			return new Num(jValue)
		} else if (typeof jValue === "boolean") {
			return new Bool(jValue)
		} else if (typeof jValue === "string") {
			return new Str(jValue)
		} else if (typeof jValue === "object") {
			const mapConv = { }
			for (const key in jValue) {
				mapConv[key] = interjm.jtomValue(jValue[key])
			}
			return new Record(mapConv)
		}
		return undefined
	}

	interjm.mtojValue = function (mValue) {
		if (mValue instanceof Num || mValue instanceof Str || mValue instanceof Bool) {
			return mValue.getValue()
		} else if (mValue instanceof Record) {
			return mValue.map
		} else if (mValue instanceof Pair) {
			return { fst: interjm.mtojValue(mValue.e1), snd: interjm.mtojValue(mValue.e2) }
		}
		return undefined
	}

	return interjm
})()
