(function () {
	"use strict"

	const Env = require('../interpreter/Env.js').Env
	const ToLL = require('../lli/ToLL.js').ToLL
	const LLI = require('../lli/LLI.js').LLI

	const { buildAst } = require('../../src/ast/AstBuilder.js').AstBuilder

	function parse (source) {
		const tokens = espace.Tokenizer()(source)
		const rawTree = espace.Parser.parse(tokens)
		return buildAst(rawTree)
	}

	function _e (source) {
		return parse(source).ev(Env.Emp)
	}

	function _ell (source) {
		const lli = new LLI()
		const opStack = lli.interpret(source)

		if (opStack.length !== 1) {
			throw 'Too many/few elements left on stack'
		}

		return opStack[0]
	}

	function _trll (source) {
		const ast = parse(source)
		return ast.accept(new ToLL())
	}

	function _eqll (source) {
		return _e(source).getValue() === _ell(_trll(source))
	}

	module('toLL')

	test('Primitives', function () {
		ok(_eqll('25'), 'num')
	})

	test('Simple functions', function () {
		ok(_eqll('(+ 23 54)'), '+ num num')
		ok(_eqll('(* 23 54)'), '+ num num')
		ok(_eqll('(> 23 54)'), '+ num num')
		ok(_eqll('(> 54 23)'), '+ num num')

		ok(_eqll('(if (> 1 2) 30 20)'), 'if #t')
		ok(_eqll('(if (> 2 1) 30 20)'), 'if #f')
	})

	test('Fun, Call', function () {
		ok(_eqll('(call (lambda (x) (+ x 30)) 20)'), 'call lambda')
		ok(_eqll('(call (lambda (x y) (+ x y)) 10 45)'), 'call lambda')
	})
})()
