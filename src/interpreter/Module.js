exports.Module = (() => {
	'use strict'

	const { Env } = require('./Env.js')
	const { Closure } = require('./nodes/Closure.js')
	const { VarBinding } = require('./VarBinding.js')

	function Module (name, defs) {
		this.name = name
		this.defs = defs
		this.publicDefs = Module.getPub(defs)
		this.privateEnv = Module.getEnv(defs)
	}

	Module.getPub = function (defs) {
		return defs.filter(({ pub }) => pub === 'public')
	}

	Module.getEnv = function (defs) {
		return defs.reduce(
			(env, { defName, fun }) => env.con(
				new VarBinding(defName,
					new Closure(Env.Emp, fun),
					true
				)
			),
			Env.Emp
		)
	}

	Module.prototype.getVal = function (name) {
		for (const publicDef of this.publicDefs) {
			if (publicDef.defName === name) {
				return publicDef
			}
		}

		throw 'Could not find ' + name + ' in module ' + this.name
	}

	Module.prototype.accept = function (visitor, state) {
		return visitor.visitModule(this, state)
	}

	return Module
})()
