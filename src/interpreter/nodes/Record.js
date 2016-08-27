exports.Record = (() => {
	'use strict'

	function Record (map) {
		this.map = map
	}

	Record.prototype.ev = function (env, modSet) {
		const mapEv = {}

		for (const key in this.map) {
			mapEv[key] = this.map[key].ev(env, modSet)
		}

		return new Record(mapEv)
	}

	Record.prototype.contains = function (name) {
		return this.map[name] !== undefined
	}

	Record.prototype.get = function (name) {
		if (this.contains(name)) {
			return this.map[name]
		}

		throw 'Record does not contain ' + name
	}

	Record.prototype.accept = function (visitor, state) {
		return visitor.visitRecord(this, state)
	}

	Record.prototype.toString = function () {
		let ls = ''
		for (const key in this.map) {
			ls += ' ' + key + ': ' + this.map[key].toString()
		}

		return '(record' + ls + ')'
	}

	return Record
})()
