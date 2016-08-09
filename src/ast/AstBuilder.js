exports.AstBuilder = (function () {
	"use strict"

	const { Add } = require('../interpreter/nodes/Add.js')
	const { And } = require('../interpreter/nodes/And.js')
	const { ArrJS } = require('../interpreter/nodes/ArrJS.js')
	const { Bool } = require('../interpreter/nodes/Bool.js')
	const { BoolQ } = require('../interpreter/nodes/BoolQ.js')
	const { Call } = require('../interpreter/nodes/Call.js')
	const { CallJS } = require('../interpreter/nodes/CallJS.js')
	const { ClosureQ } = require('../interpreter/nodes/ClosureQ.js')
	const { ContainsQ } = require('../interpreter/nodes/ContainsQ.js')
	const { Def } = require('../interpreter/nodes/Def.js')
	const { Deref } = require('../interpreter/nodes/Deref.js')
	const { Div } = require('../interpreter/nodes/Div.js')
	const { Fun } = require('../interpreter/nodes/Fun.js')
	const { Fst } = require('../interpreter/nodes/Fst.js')
	const { Greater } = require('../interpreter/nodes/Greater.js')
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
	const { SetFst } = require('../interpreter/nodes/SetFst.js')
	const { SetSnd } = require('../interpreter/nodes/SetSnd.js')
	const { Snd } = require('../interpreter/nodes/Snd.js')
	const { Str } = require('../interpreter/nodes/Str.js')
	const { StrQ } = require('../interpreter/nodes/StrQ.js')
	const { Sub } = require('../interpreter/nodes/Sub.js')
	const { Unit } = require('../interpreter/nodes/Unit.js')
	const { UnitQ } = require('../interpreter/nodes/UnitQ.js')
	const { Var } = require('../interpreter/nodes/Var.js')
	const { Xor } = require('../interpreter/nodes/Xor.js')

	const { Any } = require('../interpreter/nodes/Any.js')

	const mapping = new Map()

	const register = Map.prototype.set.bind(mapping)

	function registerUnary (name, constructor) {
		register(name, (e) => new constructor(
			buildAst(e)
		))
	}

	function registerBinary (name, constructor) {
		register(name, (e1, e2) => new constructor(
			buildAst(e1),
			buildAst(e2)
		))
	}

	registerUnary('not', Not)

	registerUnary('bool?', BoolQ)
	registerUnary('closure?', ClosureQ)
	registerUnary('num?', NumQ)
	registerUnary('pair?', PairQ)
	registerUnary('record?', RecordQ)
	registerUnary('str?', StrQ)
	registerUnary('unit?', UnitQ)

	registerUnary('fst', Fst)
	registerUnary('snd', Snd)

	registerBinary('+', Add)
	registerBinary('-', Sub)
	registerBinary('*', Mul)
	registerBinary('/', Div)
	registerBinary('%', Mod)

	registerBinary('>', Greater)

	registerBinary('and', Add)
	registerBinary('or', Or)
	registerBinary('xor', Xor)

	registerBinary('pair', Pair)

	registerBinary('set-fst!', SetFst)
	registerBinary('set-snd!', SetSnd)

	register('if', (test, consequent, alternate) =>
		new If(
			buildAst(test),
			buildAst(consequent),
			buildAst(alternate)
		)
	)

	register('call', (callee, ...args) => {
		if (args.length === 0) {
			return new Call(buildAst(callee), false)
		} else {
			return args.reduce(
				(prev, arg) => new Call(prev, buildAst(arg)),
				buildAst(callee)
			)
		}
	})

	function validateArgument (item) {
		if (item.token.type !== 'identifier') {
			throw 'Expect arguments list to contain identifiers'
		}
	}

	function validateArguments (args) {
		if (args.token.type !== '(') {
			throw 'Expect function to have arguments list'
		}

		args.children.forEach(validateArgument)
	}

	register('fun', (name, args, body) => {
		if (name.token.type !== 'identifier') {
			throw 'Expect function name to be an identifier'
		}

		validateArguments(args)

		if (args.children.length === 0) {
			return new Fun(name.token, false, buildAst(body))
		} else {
			const partial = args.children.slice(1).reduceRight(
				(prev, arg) => new Fun(false, arg.token, prev),
				buildAst(body)
			)

			return new Fun(name.token, args.children[0].token, partial)
		}
	})

	register('lambda', (args, body) => {
		validateArguments(args)

		if (args.children.length === 0) {
			return new Fun(false, false, buildAst(body))
		} else {
			return args.children.reduceRight(
				(prev, arg) => new Fun(false, arg.token, prev),
				buildAst(body)
			)
		}
	})

	register('list', (...items) => {
		if (items.length === 0) {
			return new Unit()
		} else {
			return items.reduceRight(
				(prev, item) => new Pair(buildAst(item), prev),
				new Unit()
			)
		}
	})

	register('cond', (items, last) => {
		if (items.token.type !== '(') {
			throw 'Expect a list of cond pairs'
		}

		items.children.forEach((item) => {
			if (item.token.type !== '(') {
				throw 'Expect a list of cond pairs'
			}

			if (item.children.length !== 2) {
				throw 'Expect cond pairs to contain a test and a result'
			}
		})

		return items.children.reduceRight(
			(prev, item) =>
				new If(
					buildAst(item.children[0]),
					buildAst(item.children[1]),
					prev
				),
			buildAst(last)
		)
	})

	function validateBinding (item) {
		if (item.token.type !== '(') {
			throw 'Expect a list of bindings'
		}

		if (item.children.length !== 2) {
			throw 'Expect bindings to contain an identifier and an expression'
		}

		if (item.children[0].token.type !== 'identifier') {
			throw 'Expect bindings to contain an identifier and an expression'
		}
	}

	function validateBindings (items) {
		if (items.token.type !== '(') {
			throw 'Expect a list of bindings'
		}

		items.children.forEach(validateBinding)
	}

	register('let', (items, body) => {
		validateBindings(items)

		return items.children.reduceRight(
			(prev, { children: [name, expression] }) => {
				if (name.token.type !== 'identifier') {
					throw 'must be an identifier'
				}

				return new Let(name.token, buildAst(expression), prev)
			},
			buildAst(body)
		)
	})

	register('letrec', (items, body) => {
		validateBindings(items)

		const initialised = items.children.reduceRight(
			(prev, { children: [name, expression] }) =>
				new Set(name.token, buildAst(expression), prev),
			buildAst(body)
		)

		return items.children.reduceRight(
			(prev, { children: [name] }) =>
				new Let(name.token, new Any(), prev),
			initialised
		)
	})

	register('record', (...items) => {
		items.forEach(validateBinding)

		const map = {}
		items.forEach(
			({ children: [name, expression] }) => {
				map[name.token.value] = buildAst(expression)
			}
		)

		return new Record(map)
	})

	register('contains?', (...items) => {
		items.forEach(validateArgument)

		return new ContainsQ(
			items.map((item) => item.token.value)
		)
	})

	function buildAst (tree) {
		const { type, value } = tree.token

		if (type === 'number') {
			return new Num(value)
		} else if (type === 'string') {
			return new Str(value)
		} else if (type === 'identifier') {
			if (value === '#t') {
				return new Bool(true)
			} else if (value === '#f') {
				return new Bool(false)
			} else if (value === 'unit') {
				return new Unit()
			} else {
				return new Var(value)
			}
		} else {
			if (tree.children.length === 0) {
				throw 'Unexpected ()'
			}

			const [form, ...args] = tree.children
			const name = form.token.value

			if (!mapping.has(name)) {
				throw 'Unsupported form'
			}

			const handler = mapping.get(name)

			return handler(...args)
		}
	}

	function buildDefinitionAst ({ token, children }, moduleName) {
		if (token.type !== '(') {
			throw 'Expect module member definition to be a list'
		}

		if (children.length !== 3) {
			throw 'Expect module member definition to contain a ' +
				'privacy qualifier, a name and a function expression'
		}

		if (
			children[0].token.type !== 'identifier' ||
			!['private', 'public'].includes(children[0].token.value)
		) {
			throw 'Expect module member definition privacy qualifier ' +
				'to be either "private" or "public"'
		}

		if (children[1].token.type !== 'identifier') {
			throw 'Expect module member definition name to be an identifier'
		}

		if (
			children[2].token.type !== '(' ||
			!['fun', 'lambda'].includes(children[2].children[0].token.value)
		) {
			throw 'Expect module member definition to be a function'
		}

		const [access, name, expression] = children

		return new Def(
			name.token.value,
			moduleName,
			access.token.value,
			buildAst(expression)
		)
	}

	function buildModuleAst ({ token, children }) {
		if (token.type !== '(') {
			throw 'Expect module definition to be a list'
		}

		if (children.length < 3) {
			throw 'Expect module definition contain at least one definition'
		}

		if (
			children[0].token.type !== 'identifier' ||
			children[0].token.value !== 'module'
		) {
			throw 'Expect module definition to start with "module"'
		}

		if (children[1].token.type !== 'identifier') {
			throw 'Expect module name to be an identifier'
		}

		const [, name, ...definitions] = children

		return new Module(
			name.token.value,
			definitions.map(
				(definition) => buildDefinitionAst(definition, name.token.value)
			)
		)
	}

	return { buildModuleAst, buildAst }
})()