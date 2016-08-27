exports.ModuleSet = (() => {
	'use strict'

	function ModuleSet (mods) {
		this.mods = mods
	}

	ModuleSet.getEmp = function () {
		return new ModuleSet([])
	}

	ModuleSet.prototype.getVal = function (name) {
		const sepIndex = name.lastIndexOf('.')
		const modName = name.substring(sepIndex, 0)
		const defName = name.substring(sepIndex + 1)

		for (const mod of this.mods) {
			if (mod.name === modName) {
				return mod.getVal(defName)
			}
		}

		throw 'Module ' + modName + ' is not defined'
	}

	ModuleSet.prototype.getEnv = function (name) {
		for (const mod of this.mods) {
			if (mod.name === name) {
				return mod.privateEnv
			}
		}

		throw 'Module ' + name + ' is not defined'
	}

	ModuleSet.prototype.accept = function (visitor, state) {
		return visitor.visitModuleSet(this, state)
	}

	return ModuleSet
})()
