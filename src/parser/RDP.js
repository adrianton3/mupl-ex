exports.RDP = (function () {
	"use strict"

	const TokEnd = require('../tokenizer/TokEnd.js').TokEnd
	const TokNum = require('../tokenizer/TokNum.js').TokNum
	const TokIdentifier = require('../tokenizer/TokIdentifier.js').TokIdentifier
	const TokBool = require('../tokenizer/TokBool.js').TokBool
	const TokStr = require('../tokenizer/TokStr.js').TokStr
	const TokLPar = require('../tokenizer/TokLPar.js').TokLPar
	const TokRPar = require('../tokenizer/TokRPar.js').TokRPar
	const TokenList = require('./TokenList.js').TokenList

	const Add = require('../interpreter/nodes/Add.js').Add
	const And = require('../interpreter/nodes/And.js').And
	const ArrJS = require('../interpreter/nodes/ArrJS.js').ArrJS
	const Bool = require('../interpreter/nodes/Bool.js').Bool
	const BoolQ = require('../interpreter/nodes/BoolQ.js').BoolQ
	const Call = require('../interpreter/nodes/Call.js').Call
	const CallJS = require('../interpreter/nodes/CallJS.js').CallJS
	const ClosureQ = require('../interpreter/nodes/ClosureQ.js').ClosureQ
	const ContainsQ = require('../interpreter/nodes/ContainsQ.js').ContainsQ
	const Def = require('../interpreter/nodes/Def.js').Def
	const Deref = require('../interpreter/nodes/Deref.js').Deref
	const Div = require('../interpreter/nodes/Div.js').Div
	const Fun = require('../interpreter/nodes/Fun.js').Fun
	const Fst = require('../interpreter/nodes/Fst.js').Fst
	const Greater = require('../interpreter/nodes/Greater.js').Greater
	const If = require('../interpreter/nodes/If.js').If
	const Let = require('../interpreter/nodes/Let.js').Let
	const Mod = require('../interpreter/nodes/Mod.js').Mod
	const Module = require('../interpreter/Module.js').Module
	const ModuleSet = require('../interpreter/ModuleSet.js').ModuleSet
	const Mul = require('../interpreter/nodes/Mul.js').Mul
	const Not = require('../interpreter/nodes/Not.js').Not
	const Num = require('../interpreter/nodes/Num.js').Num
	const NumQ = require('../interpreter/nodes/NumQ.js').NumQ
	const Or = require('../interpreter/nodes/Or.js').Or
	const Pair = require('../interpreter/nodes/Pair.js').Pair
	const PairQ = require('../interpreter/nodes/PairQ.js').PairQ
	const Record = require('../interpreter/nodes/Record.js').Record
	const RecordQ = require('../interpreter/nodes/RecordQ.js').RecordQ
	const Set = require('../interpreter/nodes/Set.js').Set
	const SetFst = require('../interpreter/nodes/SetFst.js').SetFst
	const SetSnd = require('../interpreter/nodes/SetSnd.js').SetSnd
	const Snd = require('../interpreter/nodes/Snd.js').Snd
	const Str = require('../interpreter/nodes/Str.js').Str
	const StrQ = require('../interpreter/nodes/StrQ.js').StrQ
	const Sub = require('../interpreter/nodes/Sub.js').Sub
	const Unit = require('../interpreter/nodes/Unit.js').Unit
	const UnitQ = require('../interpreter/nodes/UnitQ.js').UnitQ
	const Var = require('../interpreter/nodes/Var.js').Var
	const Xor = require('../interpreter/nodes/Xor.js').Xor

	const Any = require('../interpreter/nodes/Any.js').Any

	const RDP = { }

	RDP.errPref = 'Parsing exception: '

	RDP.tree = function (tokenar) {
		const token = new TokenList(tokenar)
		const modSet = RDP.tree.start(token)
		token.expect(new TokEnd(), 'RDP: expression not properly terminated')
		return modSet
	}

	RDP.single = function (tokenar) {
		const token = new TokenList(tokenar)
		const t = RDP.tree.exp(token)
		token.expect(new TokEnd(), 'RDP: expression not properly terminated')
		return t
	}

	RDP.tree.num = new TokNum()
	RDP.tree.identifier = new TokIdentifier()
	RDP.tree.bool = new TokBool()
	RDP.tree.str = new TokStr()

	RDP.tree.lPar = new TokLPar()
	RDP.tree.rPar = new TokRPar()

	RDP.tree.start = function (token) {
		const ret = []
		while (token.match(RDP.tree.lPar)) {
			token.adv()
			token.expect('module', 'RDP: module expected')
			token.expect(RDP.tree.identifier, 'RDP: module name expected')
			const name = token.past().s
			const list = RDP.tree.defList(token, name)
			token.expect(RDP.tree.rPar, 'RDP: mod: Missing rpar')

			ret.push(new Module(name, list))
		}
		return new ModuleSet(ret)
	}

	RDP.tree.defList = function (token, modName) {
		const ret = []
		while (token.match(RDP.tree.lPar)) {
			token.adv()

			let pub
			if (token.match('public')) {
				pub = true
			} else if (token.match('private')) {
				pub = false
			} else {
				throw 'RDP: def can be either public or private'
			}
			token.adv()

			token.expect(RDP.tree.identifier, 'RDP: def name expected')
			const defName = token.past().s

			token.expect(RDP.tree.lPar, 'RDP: def: Missing lpar')

			let fun
			if (token.match('fun')) {
				token.adv()
				fun = RDP.tree.special._funStar(token)
			} else if (token.match('lambda')) {
				token.adv()
				fun = RDP.tree.special._lambdaStar(token)
			} else {
				throw 'RDP: def can bind only functions'
			}

			ret.push(new Def(defName, modName, pub, fun))
			token.expect(RDP.tree.rPar, 'RDP: def: Missing rpar')
		}

		return ret
	}

	RDP.tree.exp = function (token) {
		if (token.match(RDP.tree.lPar)) {
			token.adv()
			return RDP.tree.special(token)
		} else if (token.match(RDP.tree.bool)) {
			const tmp = token.next()
			return new Bool(tmp.s === '#t')
		} else if (token.match(RDP.tree.num)) {
			return new Num(token.next().n)
		} else if (token.match(RDP.tree.str)) {
			return new Str(token.next().s)
		} else if (token.match('unit')) {
			token.adv()
			return new Unit()
		} else if (token.match(RDP.tree.identifier)) {
			const vTok = token.next()
			return new Var(vTok.s, vTok.coords)
		} else {
			throw 'RDP: expected expression but got ' + token.cur() + ' ' + token.cur().coords
		}
	}

	RDP.tree.ifList = function (token) {
		const list = []
		while (!token.match(RDP.tree.rPar)) {
			token.adv()
			const cond = RDP.tree.exp(token)
			const exp = RDP.tree.exp(token)
			token.expect(RDP.tree.rPar, 'RDP: iflist: Missing rpar')

			list.push(new CondPair(cond, exp))
		}

		return list
	}

	RDP.tree.funParamList = function (token) {
		const list = []
		while (!token.match(RDP.tree.rPar)) {
			token.expect(RDP.tree.identifier, 'RDP: fun: identifiers expected')
			list.push(token.past().s)
		}

		return list
	}

	RDP.tree.callParamList = function (token) {
		const list = []
		while (!token.match(RDP.tree.rPar)) {
			const exp = RDP.tree.exp(token)
			list.push(exp)
		}

		return list
	}

	RDP.tree.letList = function (token) {
		const list = []
		while (!token.match(RDP.tree.rPar)) {
			token.adv()
			token.expect(RDP.tree.identifier, 'RDP: letlist: first parameter must be an identifier')
			const name = token.past().s
			const exp = RDP.tree.exp(token)
			token.expect(RDP.tree.rPar, 'RDP: letlist: missing rpar')

			list.push(new LetStarPair(name, exp))
		}

		return list
	}

	RDP.tree.letrecList = function (token) {
		const list = []
		while (!token.match(RDP.tree.rPar)) {
			token.adv()
			token.expect(RDP.tree.identifier, 'RDP: letreclist: first parameter must be an identifier')
			const name = token.past().s
			const exp = RDP.tree.exp(token)
			token.expect(RDP.tree.rPar, 'RDP: letreclist: missing rpar')

			list.push(new LetrecStarPair(name, exp))
		}

		return list
	}

	RDP.tree.pairList = function (token) {
		const list = []
		while (!token.match(RDP.tree.rPar)) {
			const exp = RDP.tree.exp(token)
			list.push(exp)
		}

		return list
	}

	RDP.tree.recordList = function (token) {
		const map = {}
		while (!token.match(RDP.tree.rPar)) {
			token.adv()
			token.expect(RDP.tree.identifier, 'RDP: first record pair member must be an identifier')
			const name = token.past().s
			const exp = RDP.tree.exp(token)
			token.expect(RDP.tree.rPar, 'RDP: record: Missing rpar')

			map[name] = exp
		}
		return map
	}

	RDP.tree.containsList = function (token) {
		const list = []

		token.expect(RDP.tree.identifier, 'RDP: contains?: identifiers expected')
		list.push(token.past().s)

		while (!token.match(RDP.tree.rPar)) {
			token.expect(RDP.tree.identifier, 'RDP: contains?: identifiers expected')
			list.push(token.past().s)
		}

		return list
	}

	RDP.tree.arrJSList = function (token) {
		const list = []
		while (!token.match(RDP.tree.rPar)) {
			const exp = RDP.tree.exp(token)
			list.push(exp)
		}
		return list
	}

	RDP.tree.callJSList = function (token) {
		const list = []
		while (!token.match(RDP.tree.rPar)) {
			const exp = RDP.tree.exp(token)
			list.push(exp)
		}
		return list
	}

	RDP.tree.special = function (token) {
		for (const i in RDP.tree.special.bindings) {
			if (token.match(RDP.tree.special.bindings[i].s)) {
				token.adv()
				return RDP.tree.special.bindings[i].h(token)
			}
		}

		throw 'RDP: unknown function: ' + token.cur()
	}
	//-----------------------------------------------------------------------------
	RDP.tree.special._add = function (token) {
		const addTok = token.past()
		const addE1 = RDP.tree.exp(token)
		const addE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: +: Missing rpar')
		return new Add(addE1, addE2, addTok.coords)
	}

	RDP.tree.special._and = function (token) {
		const andTok = token.past()
		const andE1 = RDP.tree.exp(token)
		const andE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: and: Missing rpar')
		return new And(andE1, andE2, andTok.coords)
	}

	RDP.tree.special._arrJS = function (token) {
		const arrJSTok = token.past()
		token.expect(RDP.tree.identifier, 'RDP: first arrjs parameter must be an identifier')
		const arrJSName = token.past().s
		const arrJSList = RDP.tree.arrJSList(token)
		token.expect(RDP.tree.rPar, 'RDP: arrJS: Missing rpar')
		return new ArrJS(arrJSName, arrJSList, arrJSTok.coords)
	}

	RDP.tree.special._boolQ = function (token) {
		const boolQTok = token.past()
		const boolQE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: bool?: Missing rpar')
		return new BoolQ(boolQE, boolQTok.coords)
	}

	RDP.tree.special._callStar = function (token) {
		const callStarTok = token.past()
		const callCallee = RDP.tree.exp(token)
		const callParamList = RDP.tree.callParamList(token)
		token.expect(RDP.tree.rPar, 'RDP: call*: Missing rpar')
		return callStar(callCallee, callParamList, callStarTok.coords)
	}

	RDP.tree.special._callJS = function (token) {
		const callJSTok = token.past()
		token.expect(RDP.tree.identifier, 'RDP: first calljs parameter must be an identifier')
		const callJSName = token.past().s
		const callJSList = RDP.tree.callJSList(token)
		token.expect(RDP.tree.rPar, 'RDP: calljs: Missing rpar')
		return new CallJS(callJSName, callJSList, callJSTok.coords)
	}

	RDP.tree.special._closureQ = function (token) {
		const closureQTok = token.past()
		const closureE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: closure?: Missing rpar')
		return new ClosureQ(closureE, closureQTok.coords)
	}

	RDP.tree.special._cond = function (token) {
		const condTok = token.past()
		token.expect(RDP.tree.lPar, 'RDP: cond missing lpar')
		const condList = RDP.tree.ifList(token)
		token.expect(RDP.tree.rPar, 'RDP: cond missing rpar')
		const condDef = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: cond: Missing rpar')
		return cond(condList, condDef, condTok.coords)
	}

	RDP.tree.special._containsQ = function (token) {
		const containsQTok = token.past()
		const containsExp = RDP.tree.exp(token)
		const containsList = RDP.tree.containsList(token)
		token.expect(RDP.tree.rPar, 'RDP: contains?: Missing rpar')
		return new ContainsQ(containsExp, containsList, containsQTok.coords)
	}

	RDP.tree.special._deref = function (token) {
		const derefTok = token.past()
		const derefExp = RDP.tree.exp(token)
		token.expect(RDP.tree.identifier, 'RDP: second deref parameter must be an identifier')
		const derefName = token.past().s
		token.expect(RDP.tree.rPar, 'RDP: deref: Missing rpar')
		return new Deref(derefExp, derefName, derefTok, derefTok.coords)
	}

	RDP.tree.special._div = function (token) {
		const divTok = token.past()
		const divE1 = RDP.tree.exp(token)
		const divE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: /: Missing rpar')
		return new Div(divE1, divE2, divTok.coords)
	}

	RDP.tree.special._err = function (token) {
		const errTok = token.past()
		const errExp = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: err: Missing rpar')
		return new Err(errExp, errTok.coords)
	}

	RDP.tree.special._fst = function (token) {
		const fstTok = token.past()
		const fstE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: fst: Missing rpar')
		return new Fst(fstE, fstTok.coords)
	}

	RDP.tree.special._funStar = function (token) {
		const funStarTok = token.past()
		token.expect(RDP.tree.identifier, 'RDP: first fun parameter must be an identifier')
		const funName = token.past().s
		token.expect(RDP.tree.lPar, 'RDP: fun missing lpar')
		const funParamList = RDP.tree.funParamList(token)
		token.expect(RDP.tree.rPar, 'RDP: fun missing rpar')
		const funBody = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: fun: Missing rpar')
		return new funStar(funName, funParamList, funBody, funStarTok.coords)
	}

	RDP.tree.special._greater = function (token) {
		const greaterTok = token.past()
		const greaterE1 = RDP.tree.exp(token)
		const greaterE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: >: Missing rpar')
		return new Greater(greaterE1, greaterE2, greaterTok.coords)
	}

	RDP.tree.special._if = function (token) {
		const ifTok = token.past()
		const ifCond = RDP.tree.exp(token)
		const ifThen = RDP.tree.exp(token)
		const ifElse = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: if: Missing rpar')
		return new If(ifCond, ifThen, ifElse, ifTok.coords)
	}

	RDP.tree.special._lambdaStar = function (token) {
		const lambdaStarTok = token.past()
		token.expect(RDP.tree.lPar, 'RDP: lambda missing lpar')
		const funParamList = RDP.tree.funParamList(token)
		token.expect(RDP.tree.rPar, 'RDP: lambda missing rpar')
		const funBody = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: lambda: Missing rpar')
		return new funStar(false, funParamList, funBody, lambdaStarTok.coords)
	}

	RDP.tree.special._let = function (token) {
		const letTok = token.past()
		token.expect(RDP.tree.identifier, 'RDP: first let parameter must be an identifier')
		const letName = token.past().s
		const letExp = RDP.tree.exp(token)
		const letBody = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: let: Missing rpar')
		return new Let(letName, letExp, letBody, true, letTok.coords)
	}

	RDP.tree.special._letStar = function (token) {
		const letStarTok = token.past()
		token.expect(RDP.tree.lPar, 'RDP: let* missing lpar')
		const letList = RDP.tree.letList(token)
		token.expect(RDP.tree.rPar, 'RDP: let* missing rpar')
		const letBody = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: let*: Missing rpar')
		return letStar(letList, letBody, letStarTok.coords)
	}

	RDP.tree.special._letrecStar = function (token) {
		const letrecStarTok = token.past()
		token.expect(RDP.tree.lPar, 'RDP: letrec missing lpar')
		const letrecList = RDP.tree.letrecList(token)
		token.expect(RDP.tree.rPar, 'RDP: letrec missing rpar')
		const letrecBody = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: letrec: Missing rpar')
		return letrecStar(letrecList, letrecBody, letrecStarTok.coords)
	}

	RDP.tree.special._list = function (token) {
		const listTok = token.past()
		const pairList = RDP.tree.pairList(token)
		token.expect(RDP.tree.rPar, 'RDP: list: Missing rpar')
		return pairStar(pairList, listTok.coords)
	}

	RDP.tree.special._mod = function (token) {
		const modTok = token.past()
		const modE1 = RDP.tree.exp(token)
		const modE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: %: Missing rpar')
		return new Mod(modE1, modE2, modTok.coords)
	}

	RDP.tree.special._mul = function (token) {
		const mulTok = token.past()
		const mulE1 = RDP.tree.exp(token)
		const mulE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: *: Missing rpar')
		return new Mul(mulE1, mulE2, mulTok.coords)
	}

	RDP.tree.special._mut = function (token) {
		const mutTok = token.past()
		token.expect(RDP.tree.identifier, 'RDP: first mut parameter must be an identifier')
		const mutName = token.past().s
		const mutExp = RDP.tree.exp(token)
		const mutBody = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: mut: Missing rpar')
		return new Let(mutName, mutExp, mutBody, false, mutTok.coords)
	}

	RDP.tree.special._not = function (token) {
		const notTok = token.past()
		const notE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: not: Missing rpar')
		return new Not(notE, notTok.coords)
	}

	RDP.tree.special._numQ = function (token) {
		const numQTok = token.past()
		const numQE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: num?: Missing rpar')
		return new NumQ(numQE, numQTok.coords)
	}

	RDP.tree.special._or = function (token) {
		const orTok = token.past()
		const orE1 = RDP.tree.exp(token)
		const orE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: or: Missing rpar')
		return new Or(orE1, orE2, orTok.coords)
	}

	RDP.tree.special._pair = function (token) {
		const pairTok = token.past()
		const pairE1 = RDP.tree.exp(token)
		const pairE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: pair: Missing rpar')
		return new Pair(pairE1, pairE2, pairTok.coords)
	}

	RDP.tree.special._pairQ = function (token) {
		const pairQTok = token.past()
		const pairE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: pair?: Missing rpar')
		return new PairQ(pairE, pairQTok.coords)
	}

	RDP.tree.special._print = function (token) {
		const printTok = token.past()
		const printPrintExp = RDP.tree.exp(token)
		const printRetExp = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: print: Missing rpar')
		return new Print(printPrintExp, printRetExp, printTok.coords)
	}

	RDP.tree.special._record = function (token) {
		const recordTok = token.past()
		const recordList = RDP.tree.recordList(token)
		token.expect(RDP.tree.rPar, 'RDP: record: Missing rpar')
		return new Record(recordList, recordTok.coords)
	}

	RDP.tree.special._recordQ = function (token) {
		const recordQTok = token.past()
		const recordQE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: record?: Missing rpar')
		return new RecordQ(recordQE, recordQTok.coords)
	}

	RDP.tree.special._set = function (token) {
		const setTok = token.past()
		token.expect(RDP.tree.identifier, 'RDP: first set parameter must be an identifier')
		const setName = token.past().s
		const setValExp = RDP.tree.exp(token)
		const setRetExp = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: set: Missing rpar')
		return new Set(setName, setValExp, setRetExp, false, setTok.coords)
	}

	RDP.tree.special._setfst = function (token) {
		const setfstTok = token.past()
		token.expect(RDP.tree.identifier, 'RDP: first setfst parameter must be an identifier')
		const setfstName = token.past().s
		const setfstValExp = RDP.tree.exp(token)
		const setfstRetExp = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: setfst: Missing rpar')
		return new SetFst(setfstName, setfstValExp, setfstRetExp, setfstTok.coords)
	}

	RDP.tree.special._setsnd = function (token) {
		const setsndTok = token.past()
		token.expect(RDP.tree.identifier, 'RDP: first setsnd parameter must be an identifier')
		const setsndName = token.past().s
		const setsndValExp = RDP.tree.exp(token)
		const setsndRetExp = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: setsnd: Missing rpar')
		return new SetSnd(setsndName, setsndValExp, setsndRetExp, setsndTok.coords)
	}

	RDP.tree.special._snd = function (token) {
		const sndTok = token.past()
		const sndE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: snd: Missing rpar')
		return new Snd(sndE, sndTok.coords)
	}

	RDP.tree.special._strQ = function (token) {
		const strQTok = token.past()
		const strQE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: str?: Missing rpar')
		return new StrQ(strQE, strQTok.coords)
	}

	RDP.tree.special._sub = function (token) {
		const subTok = token.past()
		const subE1 = RDP.tree.exp(token)
		const subE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: -: Missing rpar')
		return new Sub(subE1, subE2, subTok.coords)
	}

	RDP.tree.special._unitQ = function (token) {
		const unitQTok = token.past()
		const unitQE = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: unit?: Missing rpar')
		return new UnitQ(unitQE, unitQTok.coords)
	}

	RDP.tree.special._xor = function (token) {
		const xorTok = token.past()
		const xorE1 = RDP.tree.exp(token)
		const xorE2 = RDP.tree.exp(token)
		token.expect(RDP.tree.rPar, 'RDP: xor: Missing rpar')
		return new Xor(xorE1, xorE2, xorTok.coords)
	}

	RDP.tree.special.bindings = [
		new StrHandlerPair('+', RDP.tree.special._add ),
		new StrHandlerPair('and', RDP.tree.special._and ),
		new StrHandlerPair('arrjs', RDP.tree.special._arrJS ),
		new StrHandlerPair('bool?', RDP.tree.special._boolQ ),
		new StrHandlerPair('call', RDP.tree.special._callStar ),
		new StrHandlerPair('calljs', RDP.tree.special._callJS ),
		new StrHandlerPair('closure?', RDP.tree.special._closureQ ),
		new StrHandlerPair('cond', RDP.tree.special._cond ),
		new StrHandlerPair('contains?', RDP.tree.special._containsQ ),
		new StrHandlerPair('deref', RDP.tree.special._deref ),
		new StrHandlerPair('/', RDP.tree.special._div ),
		new StrHandlerPair('err', RDP.tree.special._err ),
		new StrHandlerPair('fst', RDP.tree.special._fst ),
		new StrHandlerPair('fun', RDP.tree.special._funStar ),
		new StrHandlerPair('>', RDP.tree.special._greater ),
		new StrHandlerPair('if', RDP.tree.special._if ),
		new StrHandlerPair('lambda', RDP.tree.special._lambdaStar),
		new StrHandlerPair('let', RDP.tree.special._let ),
		new StrHandlerPair('let*', RDP.tree.special._letStar ),
		new StrHandlerPair('letrec', RDP.tree.special._letrecStar),
		new StrHandlerPair('list', RDP.tree.special._list ),
		new StrHandlerPair('%', RDP.tree.special._mod ),
		new StrHandlerPair('*', RDP.tree.special._mul ),
		new StrHandlerPair('mut', RDP.tree.special._mut ),
		new StrHandlerPair('not', RDP.tree.special._not ),
		new StrHandlerPair('num?', RDP.tree.special._numQ ),
		new StrHandlerPair('or', RDP.tree.special._or ),
		new StrHandlerPair('pair', RDP.tree.special._pair ),
		new StrHandlerPair('pair?', RDP.tree.special._pairQ ),
		new StrHandlerPair('print', RDP.tree.special._print ),
		new StrHandlerPair('record', RDP.tree.special._record ),
		new StrHandlerPair('record?', RDP.tree.special._recordQ ),
		new StrHandlerPair('set!', RDP.tree.special._set ),
		new StrHandlerPair('setfst!', RDP.tree.special._setfst ),
		new StrHandlerPair('setsnd!', RDP.tree.special._setsnd ),
		new StrHandlerPair('snd', RDP.tree.special._snd ),
		new StrHandlerPair('string?', RDP.tree.special._strQ ),
		new StrHandlerPair('-', RDP.tree.special._sub ),
		new StrHandlerPair('unit?', RDP.tree.special._unitQ ),
		new StrHandlerPair('xor', RDP.tree.special._xor )]
	// =============================================================================
	function StrHandlerPair (s, h) {
		this.s = s
		this.h = h
	}
	//-----------------------------------------------------------------------------
	function callStar (funexp, list, tokenCoords) {
		if (list.length > 0) {
			let old = new Call(funexp, list[0], tokenCoords)
			for (let i = 1; i < list.length; i++)
				old = new Call(old, list[i], tokenCoords)

			return old
		}
		else return new Call(funexp, false, tokenCoords)
	}
	//-----------------------------------------------------------------------------
	function cond (list, def, tokenCoords) {
		let old = def
		for (let i = list.length - 1; i >= 0; i--)
			old = new If(list[i].cond, list[i].exp, old, tokenCoords)

		return old
	}

	function CondPair (cond, exp) {
		this.cond = cond
		this.exp = exp
	}
	//-----------------------------------------------------------------------------
	function funStar (name, list, body, tokenCoords) {
		let old = body

		if (list.length == 0) {
			return new Fun(name, false, old, tokenCoords)
		}
		else {
			for (let i = list.length - 1; i > 0; i--)
				old = new Fun(false, list[i], old, tokenCoords)

			return new Fun(name, list[0], old, tokenCoords)
		}
	}
	//-----------------------------------------------------------------------------
	function letrecStar (list, body, tokenCoords) {
		let old = body

		for (var i = list.length - 1; i >= 0; i--)
			old = new Set(list[i].name, list[i].exp, old, true, tokenCoords)

		for (var i = list.length - 1; i >= 0; i--)
			old = new Let(list[i].name, new Any(), old, true, tokenCoords)

		return old
	}

	function LetrecStarPair (name, exp) {
		this.name = name
		this.exp = exp
	}
	//-----------------------------------------------------------------------------
	function letStar (list, body, tokenCoords) {
		let old = body
		for (let i = list.length - 1; i >= 0; i--)
			old = new Let(list[i].name, list[i].exp, old, true, tokenCoords)

		return old
	}

	function LetStarPair (name, exp) {
		this.name = name
		this.exp = exp
	}
	//-----------------------------------------------------------------------------
	function pairStar (list, tokenCoords) {
		let old = new Unit()
		for (let i = list.length - 1; i >= 0; i--)
			old = new Pair(list[i], old, tokenCoords)

		return old
	}
	//-----------------------------------------------------------------------------
	return RDP
})()
