exports.RecordQ = (() => {
	'use strict'

	const { Record } = require('./Record.js')
	const { Bool } = require('./Bool.js')

	function RecordQ (e) {
		this.e = e
	}

	RecordQ.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		return new Bool(eEv instanceof Record)
	}

	RecordQ.prototype.accept = function (visitor, state) {
		return visitor.visitRecordQ(this, state)
	}

	RecordQ.prototype.toString = function () {
		return '(record? ' + this.e + ')'
	}

	return RecordQ
})()
