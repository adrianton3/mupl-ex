(function () {
	"use strict"

	const { Env } = require('../interpreter/Env.js')

	const { ToJS } = require('../interpreter/ToJS.js')

	const { buildAst } = require('../../src/ast/AstBuilder.js').AstBuilder

	function parse (source) {
		const tokens = espace.Tokenizer()(source)
		const rawTree = espace.Parser.parse(tokens)
		return buildAst(rawTree)
	}

	function _e (source) {
		return parse(source).ev(Env.Emp)
	}

	function _ej (source) {
		return eval(source)
	}

	function _tr (source) {
		const ast = parse(source)
		return ToJS.header() + '\n\n' + ast.accept(new ToJS())
	}

	function _eqj (source) {
		return _e(source).getValue() === _ej(_tr(source))
	}

	module('toJS')

	test('Primitives', function () {
		ok(_eqj('25'), 'num')
		ok(_eqj('#f'), 'bool')
		ok(_eqj('"asd"'), 'str')
		ok(_eqj('(fst (pair 32 54))'), 'pair 1')
		ok(_eqj('(snd (pair 32 54))'), 'pair 2')
		ok(_eqj('(deref (record (a 10) (dsa 32)) dsa)'), 'record 1')
		ok(_eqj('(deref (record (a 10) (dsa 32)) a)'), 'record 2')
	})

	test('Simple functions', function () {
		ok(_eqj('(+ 23 54)'), '+ num num')
		ok(_eqj('(- 23 54)'), '- num num')
		ok(_eqj('(* 23 54)'), '* num num')
		ok(_eqj('(/ 23 54)'), '/ num num')
		ok(_eqj('(% 23 54)'), '% num num')

		ok(_eqj('(not #t)'), 'not bool')
		ok(_eqj('(or #t #f)'), 'or bool bool')
		ok(_eqj('(and #t #f)'), 'and bool bool')
		ok(_eqj('(xor #t #f)'), 'xor bool bool')

		ok(_eqj('(if #t 30 20)'), 'if #t')
		ok(_eqj('(if #f 30 20)'), 'if #f')
	})

	test('Let, Letrec, Fun, Call', function () {
		ok(_eqj('(let ((a 10)) (+ a 3))'), 'let')
		ok(_eqj('(let ((a 10) (b (+ a 3))) (+ b 3))'), 'let multiple')
		ok(_eqj('(letrec ((a c) (b 22) (c b)) c)'), 'letrec')
		ok(_eqj('(letrec ((f1 (lambda (x) (+ (call f2 (- x 1)) 2))) (f2 (lambda (x) (if (> x 0) (* (call f1 (- x 1)) 2) 5)))) (call f1 7))'), 'letrec')
		ok(_eqj('(let ((a 10)) (call (lambda (x) (+ a x)) 4))'), 'closure')
		ok(_eqj('(let ((f (lambda (x y) (+ x y)))) (call f 10 20))'), 'fun par1 par2')
	})
})()
