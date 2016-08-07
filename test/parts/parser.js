(() => {
	"use strict"

	const { buildAst } = require('../../src/ast/AstBuilder.js').AstBuilder

	const { TokenCoords } = require('../tokenizer/TokenCoords.js')
	
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


	function makeIdentifier (name) {
		return {
			token: {
				type: 'identifier',
				value: name
			}
		}
	}

	function parse (inText) {
		const tokens = espace.Tokenizer()(inText)
		const tree = espace.Parser.parse(tokens)
		return buildAst(tree)
	}


	module('parser')

	test('Atomic expressions', () => {
		deepEqual(parse('234'), new Num(234), 'Number')
		deepEqual(parse('"234"'), new Str('234'), 'String')
		deepEqual(parse('#t'), new Bool(true), 'Bool true')
		deepEqual(parse('#f'), new Bool(false), 'Bool false')
		deepEqual(parse('unit'), new Unit(), 'Unit')
		deepEqual(parse('id'), new Var('id'), 'Identifier')
	})

	test('Simple expressions', () => {
		deepEqual(
			parse('(unit? unit)'),
			new UnitQ(new Unit()),
			'unit?'
		)

		deepEqual(
			parse('(+ 11 22)'),
			new Add(new Num(11), new Num(22)),
			'+'
		)

		deepEqual(
			parse('(if #t 11 22)'),
			new If(new Bool(true), new Num(11), new Num(22)),
			'if'
		)
	})

	test('Call expressions', () => {
		deepEqual(
			parse('(call f)'),
			new Call(new Var('f'), false),
			'call/0'
		)

		deepEqual(
			parse('(call f 11)'),
			new Call(new Var('f'), new Num(11)),
			'call/1'
		)

		deepEqual(
			parse('(call f 11 22)'),
			new Call(
				new Call(new Var('f'), new Num(11)),
				new Num(22)
			),
			'call/2'
		)
	})

	test('Fun expressions', () => {
		deepEqual(
			parse('(fun f () 11)'),
			new Fun(makeIdentifier('f'), false, new Num(11)),
			'fun/0'
		)

		deepEqual(
			parse('(fun f (a) 11)'),
			new Fun(makeIdentifier('f'), makeIdentifier('a'), new Num(11)),
			'fun/1'
		)

		deepEqual(
			parse('(fun f (a b) 11)'),
			new Fun(
				makeIdentifier('f'),
				makeIdentifier('a'),
				new Fun(false, makeIdentifier('b'), new Num(11))
			),
			'fun/2'
		)
	})
})()