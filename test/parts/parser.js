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
	const { Set } = require('../interpreter/nodes/Set.js')
	const { Snd } = require('../interpreter/nodes/Snd.js')
	const { Str } = require('../interpreter/nodes/Str.js')
	const { StrQ } = require('../interpreter/nodes/StrQ.js')
	const { Sub } = require('../interpreter/nodes/Sub.js')
	const { Unit } = require('../interpreter/nodes/Unit.js')
	const { UnitQ } = require('../interpreter/nodes/UnitQ.js')
	const { Var } = require('../interpreter/nodes/Var.js')
	const { Xor } = require('../interpreter/nodes/Xor.js')

	const { Any } = require('../interpreter/nodes/Any.js')


	function makeIdentifier (name) {
		return {
			type: 'identifier',
			value: name,
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

	test('Fun expressions exceptions', () => {
		throws(
			() => { parse('(fun 11 () 11)') },
			/Expect function name to be an identifier/,
			'Function name is non-identifier'
		)

		throws(
			() => { parse('(fun f g 11)') },
			/Expect function to have arguments list/,
			'Arguments non-list'
		)

		throws(
			() => { parse('(fun f (11) 11)') },
			/Expect arguments list to contain identifiers/,
			'Arguments list contains non-identifiers'
		)
	})

	test('Lambda expressions', () => {
		deepEqual(
			parse('(lambda () 11)'),
			new Fun(false, false, new Num(11)),
			'lambda/0'
		)

		deepEqual(
			parse('(lambda (a) 11)'),
			new Fun(false, makeIdentifier('a'), new Num(11)),
			'lambda/1'
		)

		deepEqual(
			parse('(lambda (a b) 11)'),
			new Fun(
				false,
				makeIdentifier('a'),
				new Fun(false, makeIdentifier('b'), new Num(11))
			),
			'lambda/2'
		)
	})

	test('Let expressions', () => {
		deepEqual(
			parse('(let ((a 11)) 22)'),
			new Let(makeIdentifier('a'), new Num(11), new Num(22)),
			'let/1'
		)

		deepEqual(
			parse('(let ((a 11) (b 22)) 33)'),
			new Let(
				makeIdentifier('a'),
				new Num(11),
				new Let(makeIdentifier('b'), new Num(22), new Num(33))
			),
			'let/2'
		)
	})

	test('Cond expressions', () => {
		deepEqual(
			parse('(cond ((11 22)) 33)'),
			new If(new Num(11), new Num(22), new Num(33)),
			'cond/1'
		)

		deepEqual(
			parse('(cond ((11 22) (33 44)) 55)'),
			new If(
				new Num(11),
				new Num(22),
				new If(new Num(33), new Num(44), new Num(55))
			),
			'cond/2'
		)
	})

	test('List expressions', () => {
		deepEqual(
			parse('(list)'),
			new Unit(),
			'list/0'
		)

		deepEqual(
			parse('(list 11)'),
			new Pair(new Num(11), new Unit()),
			'list/1'
		)

		deepEqual(
			parse('(list 11 22)'),
			new Pair(new Num(11), new Pair(new Num(22), new Unit())),
			'list/2'
		)
	})

	test('Letrec expressions', () => {
		deepEqual(
			parse('(letrec ((a 11)) 22)'),
			new Let(
				makeIdentifier('a'),
				new Any(),
				new Set(makeIdentifier('a'), new Num(11), new Num(22))
			),
			'letrec/1'
		)

		deepEqual(
			parse('(letrec ((a 11) (b 22)) 33)'),
			new Let(
				makeIdentifier('a'),
				new Any(),
				new Let(
					makeIdentifier('b'),
					new Any(),
					new Set(
						makeIdentifier('a'),
						new Num(11),
						new Set(makeIdentifier('b'), new Num(22), new Num(33))
					)
				)
			),
			'letrec/2'
		)
	})
})()