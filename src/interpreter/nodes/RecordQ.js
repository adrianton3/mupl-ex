exports.RecordQ = (function () {
	"use strict"

	const Record = require('./Record.js').Record
	const Bool = require('./Bool.js').Bool

	function RecordQ (e) {
		this.e = e
	}

	RecordQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		if (eEv instanceof Record) return new Bool(true)
		else return new Bool(false)
	}

	RecordQ.prototype.accept = function (visitor, state) {
		return visitor.visitRecordQ(this, state)
	}

	RecordQ.prototype.toString = function () {
		return '(record? ' + this.e + ')'
	}

	return RecordQ
})()
