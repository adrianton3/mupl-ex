exports.Record = (() => {
	'use strict'

	function Record (map) {
		this.map = map
	}

	Record.prototype.ev = function (env, modSet) {
		const mapEv = {}

		Object.keys(this.map).forEach((key) => {
			mapEv[key] = this.map[key].ev(env, modSet)
		})

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
		const pairs = Object.keys(this.map).forEach((key) =>
			`${key}: ${this.map[key].toString()}`
		).join(', ')

		return '(record' + pairs + ')'
	}

	return Record
})()
