exports.Env = (() => {
	'use strict'

	function Env (n, tail) {
		this.n = n

		this.tail = arguments.length < 2 ?
			Env.Emp :
			tail
	}

	Env.prototype.hd = function () { return this.n }
	Env.prototype.tl = function () { return this.tail }
	Env.prototype.con = function (n) { return new Env(n, this) }
	Env.prototype.empty = function () { return false }
	Env.prototype.length = function () { return 1 + this.tail.length() }
	Env.prototype.toString = function () { return this.n.toString() + this.tail.toString() }

	Env.prototype.getBinding = function (s) {
		return this.n.s === s ?
			this.n :
			this.tail.getBinding(s)
	}

	Env.prototype.findBinding = function (s) {
		return this.n.s === s ?
			this.n.v :
			this.tail.findBinding(s)
	}

	Env.prototype.setBinding = function (s, nv) {
		if (this.n.s === s) {
			if (this.n.final) {
				throw this.n.s + ' is final'
			} else {
				this.n.v = nv
			}
		} else {
			this.tail.setBinding(s, nv)
		}
	}

	Env.prototype.setBindingBang = function (s, nv) {
		if (this.n.s === s) {
			this.n.v = nv
		} else {
			this.tail.setBindingBang(s, nv)
		}
	}

	Env.Emp = {
		hd () { throw 'Emp has no head' },
		tl () { throw 'Emp has no tail' },
		con (n) { return new Env(n, this) },
		empty () { return true },
		length () { return 0 },
		toString () { return '.' },
		getBinding (s) { throw 'Find binding failed for ' + s },
		findBinding (s) { throw 'Find binding failed for ' + s },
		setBinding (s) { throw 'Set binding failed for ' + s },
	}

	return Env
})()
