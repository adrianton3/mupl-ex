exports.StaticCheck = (() => {
	'use strict'

	const { Closure } = require('./nodes/Closure.js')
	const { Type } = require('./types/Type.js')
	const { TypeBinding } = require('./TypeBinding.js')
	const { VarCheckState } = require('./VarCheckState.js')

	function StaticCheck () {}

	const _tany = new Type( true, false, false, false, false, false, false, false)
	const _tbool = new Type(false, true, false, false, false, false, false, false)
	const _tnum = new Type(false, false, true, false, false, false, false, false)
	const _tstr = new Type(false, false, false, true, false, false, false, false)
	const _tunit = new Type(false, false, false, false, true, false, false, false)
	const _tpair = new Type(false, false, false, false, false, true, false, false)
	const _trecord = new Type(false, false, false, false, false, false, true, false)
	const _tfun_any = new Type(false, false, false, false, false, false, false, _tany)

	StaticCheck.prototype.visitAdd = function (add, state) {
		const e1t = add.e1.accept(this, state)
		if (!e1t.isNum()) {
			throw 'Expression does not type check: + ' + add.tokenCoords
		}

		const e2t = add.e2.accept(this, state)
		if (!e2t.isNum()) {
			throw 'Expression does not type check: + ' + add.tokenCoords
		}

		return _tnum
	}

	StaticCheck.prototype.visitAnd = function (and, state) {
		const e1t = and.e1.accept(this, state)
		if (!e1t.isBool()) {
			throw 'Expression does not type check: and ' + and.tokenCoords
		}

		const e2t = and.e2.accept(this, state)
		if (!e2t.isBool()) {
			throw 'Expression does not type check: and ' + and.tokenCoords
		}

		return _tbool
	}

	StaticCheck.prototype.visitAny = function (unit, state) {
		return _tany
	}

	StaticCheck.prototype.visitArrJS = function (arrJS, state) {
		arrJS.indexExps.forEach((indexExp) => {
			indexExp.accept(this, state)
		})

		return _tany
	}

	StaticCheck.prototype.visitBool = function (bool, state) {
		return _tbool
	}

	StaticCheck.prototype.visitBoolQ = function (boolQ, state) {
		boolQ.e.accept(this, state)

		return _tbool
	}

	StaticCheck.prototype.visitCall = function (call, state) {
		let funexpt

		funexpt = call.funexp.accept(this, state)

		if (funexpt instanceof Closure) {
			if (funexpt.fun.type) {
				funexpt = funexpt.fun.type
			} else {
				funexpt = _tany
			}
		}

		if (!funexpt.isFun()) {
			throw 'Expression does not type check: call ' + call.tokenCoords +
				'\n expecting function and got ' + funexpt
		}

		if (call.pexp !== false) {
			call.pexp.accept(this, state)
		}

		return funexpt.isAny() ? _tany : funexpt.fun
	}

	StaticCheck.prototype.visitCallJS = function (callJS, state) {
		callJS.parameterExps.forEach((parameterExp) => {
			parameterExp.accept(this, state)
		})

		return _tany
	}

	StaticCheck.prototype.visitClosureQ = function (closureQ, state) {
		closureQ.e.accept(this, state)

		return _tbool
	}

	StaticCheck.prototype.visitContainsQ = function (containsQ, state) {
		containsQ.list.forEach((item) => {
			if (item.includes('.')) {
				throw 'Member names (' + item + ') can not contain "." ' + containsQ.tokenCoords
			}
		})

		containsQ.exp.accept(this, state)

		return _tbool
	}

	StaticCheck.prototype.visitDef = function (def, state) {
		if (def.defName.includes('.')) {
			throw 'Def name (' + def.defName + ') can not contain "."'
		}

		return def.fun.accept(this, state)
	}

	StaticCheck.prototype.visitDeref = function (deref, state) {
		if (deref.name.includes('.')) {
			throw 'Member name (' + deref.name + ') can not contain "." ' + deref.tokenCoords
		}

		const et = deref.exp.accept(this, state)
		if (!et.isRecord()) {
			throw 'Expression does not type check: deref ' + deref.tokenCoords
		}

		return _tany
	}

	StaticCheck.prototype.visitDiv = function (div, state) {
		const e1t = div.e1.accept(this, state)
		if (!e1t.isNum()) {
			throw 'Expression does not type check: / ' + div.tokenCoords
		}

		const e2t = div.e2.accept(this, state)
		if (!e2t.isNum()) {
			throw 'Expression does not type check: / ' + div.tokenCoords
		}

		return _tnum
	}

	StaticCheck.prototype.visitErr = function (err, state) {
		err.e.accept(this, state)
		return _tany
	}

	StaticCheck.prototype.visitFst = function (fst, state) {
		const et = fst.e.accept(this, state)
		if (!et.isPair()) {
			throw 'Expression does not type check: fst ' + fst.tokenCoords
		}

		return et.equals(_tpair) ?
			fst.e.e1.accept(this, state) :
			_tany
	}

	StaticCheck.prototype.visitFun = function (fun, state) {
		let nState = state

		if (fun.name !== false) {
			if (fun.name.includes('.')) {
				throw 'Function name (' + fun.name + ') cannot contain a "." ' + fun.tokenCoords
			}
			nState = nState.con(new TypeBinding(fun.name, _tfun_any, true))
		}

		if (fun.pformal !== false) {
			if (fun.pformal.includes('.')) {
				throw 'Function parameter (' + fun.pformal + ') cannot contain a "." ' + fun.tokenCoords
			}
			nState = nState.con(new TypeBinding(fun.pformal, _tany, true))
		}

		const bodyt = fun.body.accept(this, nState)

		return new Type(false, false, false, false, false, false, false, bodyt)
	}

	StaticCheck.prototype.visitGreater = function (greater, state) {
		const e1t = greater.e1.accept(this, state)
		if (!e1t.isNum()) {
			throw 'Expression does not type check: > ' + greater.tokenCoords
		}

		const e2t = greater.e2.accept(this, state)
		if (!e2t.isNum()) {
			throw 'Expression does not type check: > ' + greater.tokenCoords
		}

		return _tbool
	}

	StaticCheck.prototype.visitIf = function (ife, state) {
		const eCondt = ife.cond.accept(this, state)
		if (!eCondt.isBool()) {
			throw 'Expression does not type check: if ' + ife.tokenCoords
		}

		const e1t = ife.e1.accept(this, state)
		const e2t = ife.e2.accept(this, state)

		return e1t.or(e2t)
	}

	StaticCheck.prototype.visitLet = function (lete, state) {
		if (lete.name.includes('.')) {
			throw 'Let binding (' + lete.name + ') cannot contain a "." ' + lete.tokenCoords
		}

		let et
		if (lete.final) {
			et = lete.e.accept(this, state)
		} else {
			et = _tany
			lete.e.accept(this, state)
		}

		const nState = state.con(new TypeBinding(lete.name, et, lete.final))
		return lete.body.accept(this, nState)
	}

	StaticCheck.prototype.visitMod = function (mod, state) {
		const e1t = mod.e1.accept(this, state)
		if (!e1t.isNum()) {
			throw 'Expression does not type check: % ' + mod.tokenCoords
		}

		const e2t = mod.e2.accept(this, state)
		if (!e2t.isNum()) {
			throw 'Expression does not type check: % ' + mod.tokenCoords
		}

		return _tnum
	}

	StaticCheck.prototype.visitModule = function (module, state) {
		module.defs.forEach((def) => {
			def.fun.type = def.accept(this, state)
		})

		return _tany
	}

	StaticCheck.prototype.visitModuleSet = function (modSet, state) {
		modSet.mods.forEach((mod) => {
			mod.accept(
				this,
				new VarCheckState(mod.privateEnv, state.modSet)
			)
		})

		return _tany
	}

	StaticCheck.prototype.visitMul = function (mul, state) {
		const e1t = mul.e1.accept(this, state)
		if (!e1t.isNum()) {
			throw 'Expression does not type check: * ' + mul.tokenCoords
		}

		const e2t = mul.e2.accept(this, state)
		if (!e2t.isNum()) {
			throw 'Expression does not type check: * ' + mul.tokenCoords
		}

		return _tnum
	}

	StaticCheck.prototype.visitNot = function (not, state) {
		const et = not.e.accept(this, state)
		if (!et.isBool()) {
			throw 'Expression does not type check: not ' + not.tokenCoords
		}

		return _tbool
	}

	StaticCheck.prototype.visitNum = function (num, state) {
		return _tnum
	}

	StaticCheck.prototype.visitNumQ = function (numQ, state) {
		numQ.e.accept(this, state)
		return _tbool
	}

	StaticCheck.prototype.visitOr = function (or, state) {
		const e1t = or.e1.accept(this, state)
		if (!e1t.isBool()) {
			throw 'Expression does not type check: or ' + or.tokenCoords
		}

		const e2t = or.e2.accept(this, state)
		if (!e2t.isBool()) {
			throw 'Expression does not type check: or ' + or.tokenCoords
		}

		return _tbool
	}

	StaticCheck.prototype.visitPair = function (pair, state) {
		pair.e1.accept(this, state)
		pair.e2.accept(this, state)
		return _tpair
	}

	StaticCheck.prototype.visitPairQ = function (pairQ, state) {
		pairQ.e.accept(this, state)
		return _tbool
	}

	StaticCheck.prototype.visitPrint = function (print, state) {
		print.e.accept(this, state)
		return print.body.accept(this, state)
	}

	StaticCheck.prototype.visitRecord = function (record, state) {
		Object.keys(record.map).forEach((key) => {
			if (key.includes('.')) {
				throw 'Record member name (' + key + ') can not contain "." ' + record.tokenCoords
			}
			record.map[key].accept(this, state)
		})

		return _trecord
	}

	StaticCheck.prototype.visitRecordQ = function (recordQ, state) {
		recordQ.e.accept(this, state)
		return _tbool
	}

	StaticCheck.prototype.visitSet = function (set, state) {
		if (set.name.includes('.')) {
			throw 'Set can be applied only on local variables ' + set.tokenCoords
		}

		const binding = state.env.getBinding(set.name)
		if (binding.final && !set.bang) {
			throw set.name + ' is final ' + set.tokenCoords
		}

		const et = set.e.accept(this, state)
		if (set.bang) {
			binding.v = et
		}

		return set.body.accept(this, state)
	}

	StaticCheck.prototype.visitSetFst = function (setFst, state) {
		if (setFst.name.includes('.')) {
			throw 'SetFst can be applied only on local variables ' + setFst.tokenCoords
		}

		const bt = state.env.findBinding(setFst.name)
		if (!bt.isPair()) {
			throw 'Cannot apply setfst! on non-pair ' + setFst.tokenCoords
		}

		setFst.e.accept(this, state)
		return setFst.body.accept(this, state)
	}

	StaticCheck.prototype.visitSetSnd = function (setSnd, state) {
		if (setSnd.name.includes('.')) {
			throw 'SetSnd can be applied only on local variables ' + setSnd.tokenCoords
		}

		const bt = state.env.findBinding(setSnd.name)
		if (!bt.isPair()) {
			throw 'Cannot apply setsnd! on non-pair ' + setSnd.tokenCoords
		}

		setSnd.e.accept(this, state)
		return setSnd.body.accept(this, state)
	}

	StaticCheck.prototype.visitSnd = function (snd, state) {
		const et = snd.e.accept(this, state)
		if (!et.isPair()) {
			throw 'Expression does not type check: snd ' + snd.tokenCoords
		}

		return et.equals(_tpair) ?
			snd.e.e2.accept(this, state) :
			_tany
	}

	StaticCheck.prototype.visitStr = function (str, state) {
		return _tstr
	}

	StaticCheck.prototype.visitStrQ = function (strQ, state) {
		strQ.e.accept(this, state)
		return _tbool
	}

	StaticCheck.prototype.visitSub = function (sub, state) {
		const e1t = sub.e1.accept(this, state)
		if (!e1t.isNum()) {
			throw 'Expression does not type check: - ' + sub.tokenCoords
		}

		const e2t = sub.e2.accept(this, state)
		if (!e2t.isNum()) {
			throw 'Expression does not type check: - ' + sub.tokenCoords
		}

		return _tnum
	}

	StaticCheck.prototype.visitUnit = function (unit, state) {
		return _tunit
	}

	StaticCheck.prototype.visitUnitQ = function (unitQ, state) {
		unitQ.e.accept(this, state)
		return _tbool
	}

	StaticCheck.prototype.visitVar = function (vare, state) {
		if (vare.extern) {
			const def = state.modSet.getVal(vare.name)

			if (def.fun.type) {
				return def.fun.type
			}

			return _tany
		}

		return state.env.findBinding(vare.name)
	}

	StaticCheck.prototype.visitXor = function (xor, state) {
		const e1t = xor.e1.accept(this, state)
		if (!e1t.isBool()) {
			throw 'Expression does not type check: xor ' + xor.tokenCoords
		}

		const e2t = xor.e2.accept(this, state)
		if (!e2t.isBool()) {
			throw 'Expression does not type check: xor ' + xor.tokenCoords
		}

		return _tbool
	}

	return StaticCheck
})()
