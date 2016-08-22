(function () {
	"use strict"

	const { buildAst, buildModuleAst } = require('../../src/ast/AstBuilder.js').AstBuilder

	const Add = require('../interpreter/nodes/Add.js').Add
	const And = require('../interpreter/nodes/And.js').And
	const Bool = require('../interpreter/nodes/Bool.js').Bool
	const BoolQ = require('../interpreter/nodes/BoolQ.js').BoolQ
	const Call = require('../interpreter/nodes/Call.js').Call
	const ClosureQ = require('../interpreter/nodes/ClosureQ.js').ClosureQ
	const ContainsQ = require('../interpreter/nodes/ContainsQ.js').ContainsQ
	const Def = require('../interpreter/nodes/Def.js').Def
	const Div = require('../interpreter/nodes/Div.js').Div
	const Fst = require('../interpreter/nodes/Fst.js').Fst
	const Fun = require('../interpreter/nodes/Fun.js').Fun
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
	const Snd = require('../interpreter/nodes/Snd.js').Snd
	const Str = require('../interpreter/nodes/Str.js').Str
	const StrQ = require('../interpreter/nodes/StrQ.js').StrQ
	const Sub = require('../interpreter/nodes/Sub.js').Sub
	const Unit = require('../interpreter/nodes/Unit.js').Unit
	const UnitQ = require('../interpreter/nodes/UnitQ.js').UnitQ
	const Var = require('../interpreter/nodes/Var.js').Var
	const Xor = require('../interpreter/nodes/Xor.js').Xor

	const VarBinding = require('../interpreter/VarBinding.js').VarBinding
	const Env = require('../interpreter/Env.js').Env

	const StaticCheck = require('../interpreter/StaticCheck.js').StaticCheck
	const VarCheckState = require('../interpreter/VarCheckState.js').VarCheckState
	const ToJS = require('../interpreter/ToJS.js').ToJS

	const Type = require('../interpreter/types/Type.js').Type

	function getRawTree (source) {
		const tokens = espace.Tokenizer()(source)
		return espace.Parser.parse(tokens)
	}

	function parse (source) {
		return buildAst(getRawTree(source))
	}

	function parseModule (source) {
		return buildModuleAst(getRawTree(source))
	}

	function _e (source, modSet) {
		return arguments.length > 1 ?
			parse(source).ev(Env.Emp, modSet) :
			parse(source).ev(Env.Emp)
	}

	function _m (source) {
		const module = parseModule(source)
		return new ModuleSet([module])
	}

	module('modules')

	test('Simple calls', function () {
		let modSet = _m('(module m (public f (lambda (x) (* x x))) (public g (lambda (x) (+ x 10))))')
		deepEqual(_e('(call m.f 5)', modSet), new Num(25), 'call')
		deepEqual(_e('(call m.g 15)', modSet), new Num(25), 'call')

		modSet = _m('(module m (public f (lambda (x) (* x (call g x)))) (public g (lambda (x) (+ x 10))))')
		deepEqual(_e('(call m.f 5)', modSet), new Num(75), 'call')

		modSet = _m('(module m (public f (lambda (x) (* x (call g x)))) (private g (lambda (x) (+ x 10))))')
		deepEqual(_e('(call m.f 5)', modSet), new Num(75), 'call')
		throws(
			() => { _e('(call m.g 5)', modSet) },
			'can not call a private function'
		)
	})

	test('Environment reset', function () {
		let modSet = _m('(module m (public f (lambda (x) (* x a))))')
		throws(
			() => { _e('(let ((a 10)) (call m.f 5))', modSet) },
			'let call'
		)

		modSet = _m('(module m (public f (lambda (x) (let ((a 10)) (call g x)))) (private g (lambda (x) (+ x a))))')
		throws(
			() => { _e('(call m.f 5)', modSet) },
			'call let call'
		)
	})
})()
