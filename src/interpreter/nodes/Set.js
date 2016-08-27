exports.Set = (() => {
	'use strict'

	function Set (name, e, body, bang, tokenCoords) {
		this.name = name
		this.e = e
		this.body = body
		this.bang = bang
		this.tokenCoords = tokenCoords
	}

	Set.prototype.ev = function (env, modSet) {
		const eEv = this.e.ev(env, modSet)

		if (this.bang) {
			env.setBindingBang(this.name, eEv)
		} else {
			env.setBinding(this.name, eEv)
		}

		return this.body.ev(env, modSet)
	}

	Set.prototype.accept = function (visitor, state) {
		return visitor.visitSet(this, state)
	}

	Set.prototype.toString = function () {
		return '(set! ' + this.name + '\n' + this.e + '\n' + this.body + ')'
	}

	return Set
})()
