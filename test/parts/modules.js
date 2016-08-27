(function () {
	"use strict"

	const { buildAst, buildModuleAst } = require('../../src/ast/AstBuilder.js').AstBuilder

	const { Add } = require('../interpreter/nodes/Add.js')
	const { And } = require('../interpreter/nodes/And.js')
	const { Bool } = require('../interpreter/nodes/Bool.js')
	const { BoolQ } = require('../interpreter/nodes/BoolQ.js')
	const { Call } = require('../interpreter/nodes/Call.js')
	const { ClosureQ } = require('../interpreter/nodes/ClosureQ.js')
	const { ContainsQ } = require('../interpreter/nodes/ContainsQ.js')
	const { Def } = require('../interpreter/nodes/Def.js')
	const { Div } = require('../interpreter/nodes/Div.js')
	const { Fst } = require('../interpreter/nodes/Fst.js')
	const { Fun } = require('../interpreter/nodes/Fun.js')
	const { If } = require('../interpreter/nodes/If.js')
	const { Let } = require('../interpreter/nodes/Let.js')
	const { Mod } = require('../interpreter/nodes/Mod.js')
	const { Module } = require('../interpreter/Module.js')
	const { ModuleSet } = require('../interpreter/ModuleSet.js')
	const { Mul } = require('../interpreter/nodes/Mul.js')
	const { Not } = require('../interpreter/nodes/Not.js')
	const { Num } = require('../interpreter/nodes/Num.js')
	const { NumQ } = require('../interpreter/nodes/NumQ.js')
	const { Or } = require('../interpreter/nodes/Or.js')
	const { Pair } = require('../interpreter/nodes/Pair.js')
	const { PairQ } = require('../interpreter/nodes/PairQ.js')
	const { Record } = require('../interpreter/nodes/Record.js')
	const { RecordQ } = require('../interpreter/nodes/RecordQ.js')
	const { Snd } = require('../interpreter/nodes/Snd.js')
	const { Str } = require('../interpreter/nodes/Str.js')
	const { StrQ } = require('../interpreter/nodes/StrQ.js')
	const { Sub } = require('../interpreter/nodes/Sub.js')
	const { Unit } = require('../interpreter/nodes/Unit.js')
	const { UnitQ } = require('../interpreter/nodes/UnitQ.js')
	const { Var } = require('../interpreter/nodes/Var.js')
	const { Xor } = require('../interpreter/nodes/Xor.js')

	const { VarBinding } = require('../interpreter/VarBinding.js')
	const { Env } = require('../interpreter/Env.js')

	const { StaticCheck } = require('../interpreter/StaticCheck.js')
	const { VarCheckState } = require('../interpreter/VarCheckState.js')
	const { ToJS } = require('../interpreter/ToJS.js')

	const { Type } = require('../interpreter/types/Type.js')

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
