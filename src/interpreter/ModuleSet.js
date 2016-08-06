exports.ModuleSet = (function () {
	"use strict"

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

		for (const i in this.mods) {
			if (this.mods[i].name === modName) {
				return this.mods[i].getVal(defName)
			}
		}

		throw 'Module ' + modName + ' is not defined'
	}

	ModuleSet.prototype.getEnv = function (name) {
		for (const i in this.mods) {
			if (this.mods[i].name === name) {
				return this.mods[i].privateEnv
			}
		}

		throw 'Module ' + name + ' is not defined'
	}

	ModuleSet.prototype.accept = function (visitor, state) {
		return visitor.visitModuleSet(this, state)
	}

	return ModuleSet
})()
