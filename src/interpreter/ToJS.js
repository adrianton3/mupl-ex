exports.ToJS = (function () {
	"use strict"

	function ToJS () { }

	ToJS.header = function () {
		return '' +
			'function _Any() {}\n' +
			'var _any = new _Any();\n' +
			'function _Unit() {}\n' +
			'var _unit = new _Unit();\n' +
			'function _unitQ(e) { return e instanceof _Unit; }\n' +
			'function _numQ(e) { return typeof e === "number"; }\n' +
			'function _boolQ(e) { return typeof e === "boolean"; }\n' +
			'function _strQ(e) { return typeof e === "string"; }\n' +
			'function _Pair(f, s) { this._f = f; this._s = s; }\n' +
			'_Pair.prototype.toString = function() { return "(" + this._f + ", " + this._s + ")"; }\n' +
			'function _pairQ(e) { return e instanceof _Pair; }\n' +
			'function _Record() { for(var i = 0, _len = arguments.length; i < _len; i += 2) '+
				'this[arguments[i]] = arguments[i+1]; }\n' +
			'function _recordQ(e) { return e instanceof _Record; }\n' +
			'function _xor(e1, e2) { return (e1 && !e2) || (!e1 && e2); }\n' +
			'function _containsQ(e, list) { for(var i in list) ' +
				'if(typeof e[list[i]] === "undefined") return false; return true; }'
	}

	ToJS.prototype.visitAdd = function (add, state) {
		const e1j = add.e1.accept(this, state)
		const e2j = add.e2.accept(this, state)

		return '(' + e1j + ' + ' + e2j + ')'
	}

	ToJS.prototype.visitAnd = function (and, state) {
		const e1j = and.e1.accept(this, state)
		const e2j = and.e2.accept(this, state)

		return '(' + e1j + ' && ' + e2j + ')'
	}

	ToJS.prototype.visitAny = function (unit, state) {
		return '_any'
	}

	ToJS.prototype.visitArrJS = function (arrJS, state) {
		const indexAr = []
		for (const i in arrJS.indexExps) {
			indexAr.push(arrJS.indexExps[i].accept(this, state))
		}
		const indexStr = indexAr.join('][')
		return arrJS.arrIdentifier + '[' + indexStr + ']'
	}

	ToJS.prototype.visitBool = function (bool, state) {
		return bool.v.toString()
	}

	ToJS.prototype.visitBoolQ = function (boolQ, state) {
		const ej = boolQ.e.accept(this, state)
		return '_boolQ(' + ej + ')'
	}

	ToJS.prototype.visitCall = function (call, state) {
		const funexpj = call.funexp.accept(this, state)
		if (call.pexp !== false) {
			const pexpj = call.pexp.accept(this, state)
			return funexpj + '(' + pexpj + ')'
		} else {
			return funexpj + '()'
		}
	}

	ToJS.prototype.visitCallJS = function (callJS, state) {
		const parameterAr = []
		for (const i in callJS.parameterExps) {
			parameterAr.push(callJS.parameterExps[i].accept(this, state))
		}
		const parameterStr = parameterAr.join(',')
		return callJS.funIdentifier + '(' + parameterStr + ')'
	}

	ToJS.prototype.visitClosureQ = function (closureQ, state) {
		const ej = closureQ.e.accept(this, state)
		return '_closureQ(' + ej + ')'
	}

	ToJS.prototype.visitContainsQ = function (containsQ, state) {
		let containsQj = ''

		for (const i in containsQ.list) {
			containsQj += '"' + containsQ.list[i] + '", '
		}

		const expj = containsQ.exp.accept(this, state)

		return '_containsQ(' + expj + ', [' + containsQj.slice(0, -2) + '])'
	}

	ToJS.prototype.visitDef = function (def, state) {
		const funj = def.fun.accept(this, state)
		const namej = def.defName

		return (def.pub ? '_module.' : 'var ') +
			namej + ' = ' + funj + ';\n\n'
	}

	ToJS.prototype.visitDeref = function (deref, state) {
		const ej = deref.exp.accept(this, state)

		return ej + '.' + deref.name
	}

	ToJS.prototype.visitDiv = function (div, state) {
		const e1j = div.e1.accept(this, state)
		const e2j = div.e2.accept(this, state)

		return '(' + e1j + ' / ' + e2j + ')'
	}

	ToJS.prototype.visitErr = function (err, state) {
		const ej = err.e.accept(this, state)

		return '(function() { throw ' + ej + '; })()'
	}

	ToJS.prototype.visitFst = function (fst, state) {
		const ej = fst.e.accept(this, state)

		return ej + '._f'
	}

	ToJS.prototype.visitFun = function (fun, state) {
		const namej = fun.name !== false ? fun.name : ''
		const pformalj = fun.pformal !== false ? fun.pformal : ''
		const bodyj = fun.body.accept(this, state)

		return '(function ' + namej + '(' + pformalj + ')\n{ return ' + bodyj + '; })'
	}

	ToJS.prototype.visitGreater = function (greater, state) {
		const e1j = greater.e1.accept(this, state)
		const e2j = greater.e2.accept(this, state)

		return e1j + ' > ' + e2j
	}

	ToJS.prototype.visitIf = function (ife, state) {
		const eCondj = ife.cond.accept(this, state)

		const e1j = ife.e1.accept(this, state)
		const e2j = ife.e2.accept(this, state)

		return eCondj + ' ? ' + e1j + ' : ' + e2j
	}

	ToJS.prototype.visitLet = function (lete, state) {
		const ej = lete.e.accept(this, state)
		const namej = lete.name
		const bodyj = lete.body.accept(this, state)

		return '(function(' + namej + ')\n{ return ' + bodyj + '; })(' + ej + ')'
	}

	ToJS.prototype.visitMod = function (mod, state) {
		const e1j = mod.e1.accept(this, state)
		const e2j = mod.e2.accept(this, state)

		return '(' + e1j + ' % ' + e2j + ')'
	}

	ToJS.prototype.visitModule = function (module, state) {
		const namej = module.name
		let defsj = ''

		for (const i in module.defs) {
			defsj += module.defs[i].accept(this, state)
		}

		return 'var ' + namej + ' = {};\n(function(_module) {\n' + defsj + '})(' + namej + ');'
	}

	ToJS.prototype.visitModuleSet = function (modSet, state) {
		let modSetj = ''

		for (const i in modSet.mods) {
			modSetj += modSet.mods[i].accept(this, state) + '\n\n'
		}

		return modSetj
	}

	ToJS.prototype.visitMul = function (mul, state) {
		const e1j = mul.e1.accept(this, state)
		const e2j = mul.e2.accept(this, state)

		return '(' + e1j + ' * ' + e2j + ')'
	}

	ToJS.prototype.visitNot = function (not, state) {
		const ej = not.e.accept(this, state)

		return '!(' + ej + ')'
	}

	ToJS.prototype.visitNum = function (num, state) {
		return num.n
	}

	ToJS.prototype.visitNumQ = function (numQ, state) {
		const ej = numQ.e.accept(this, state)

		return '_numQ(' + ej + ')'
	}

	ToJS.prototype.visitOr = function (or, state) {
		const e1j = or.e1.accept(this, state)
		const e2j = or.e2.accept(this, state)

		return '(' + e1j + ' || ' + e2j + ')'
	}

	ToJS.prototype.visitPair = function (pair, state) {
		const e1j = pair.e1.accept(this, state)
		const e2j = pair.e2.accept(this, state)

		return '(new _Pair(' + e1j + ', ' + e2j + '))'
	}

	ToJS.prototype.visitPairQ = function (pairQ, state) {
		const ej = pairQ.e.accept(this, state)

		return '_pairQ(' + ej + ')'
	}

	ToJS.prototype.visitPrint = function (print, state) {
		const ej = print.e.accept(this, state)
		const bodyj = print.body.accept(this, state)

		return '(console.log(' + ej + '), ' + bodyj + ')'
	}

	ToJS.prototype.visitRecord = function (record, state) {
		let recordj = ''
		for (const key in record.map) {
			const namej = key
			const expj = record.map[key].accept(this, state)
			recordj += '"' + namej + '", ' + expj + ', '
		}

		return '(new _Record(' + recordj.slice(0, -2) + '))'
	}

	ToJS.prototype.visitRecordQ = function (recordQ, state) {
		const ej = recordQ.e.accept(this, state)

		return '_recordQ(' + ej + ')'
	}

	ToJS.prototype.visitSet = function (set, state) {
		const namej = set.name
		const ej = set.e.accept(this, state)
		const bodyj = set.body.accept(this, state)

		return '(' + namej + '=' + ej + ', ' + bodyj + ')'
	}

	ToJS.prototype.visitSetFst = function (setFst, state) {
		const namej = setFst.name
		const ej = setFst.e.accept(this, state)
		const bodyj = setFst.body.accept(this, state)

		return '(' + namej + '._f = ' + ej + ', ' + bodyj + ')'
	}

	ToJS.prototype.visitSetSnd = function (setSnd, state) {
		const namej = setSnd.name
		const ej = setSnd.e.accept(this, state)
		const bodyj = setSnd.body.accept(this, state)

		return '(' + namej + '._s = ' + ej + ', ' + bodyj + ')'
	}

	ToJS.prototype.visitSnd = function (snd, state) {
		const ej = snd.e.accept(this, state)

		return ej + '._s'
	}

	ToJS.prototype.visitStr = function (str, state) {
		return "'" + str.s + "'"
	}

	ToJS.prototype.visitStrQ = function (strQ, state) {
		const ej = strQ.e.accept(this, state)

		return '_strQ(' + ej + ')'
	}

	ToJS.prototype.visitSub = function (sub, state) {
		const e1j = sub.e1.accept(this, state)
		const e2j = sub.e2.accept(this, state)

		return '(' + e1j + ' - ' + e2j + ')'
	}

	ToJS.prototype.visitUnit = function (unit, state) {
		return '_unit'
	}

	ToJS.prototype.visitUnitQ = function (unitQ, state) {
		const ej = unitQ.e.accept(this, state)

		return '_unitQ(' + ej + ')'
	}

	ToJS.prototype.visitVar = function (vare, state) {
		return vare.name
	}

	ToJS.prototype.visitXor = function (xor, state) {
		const e1j = xor.e1.accept(this, state)
		const e2j = xor.e2.accept(this, state)

		return '_xor(' + e1j + ',' + e2j + ')'
	}

	return ToJS
})()
