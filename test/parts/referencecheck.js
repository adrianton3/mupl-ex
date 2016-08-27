(function () {
	"use strict"

	const { Env } = require('../interpreter/Env.js')

	const { StaticCheck } = require('../interpreter/StaticCheck.js')
	const { VarCheckState } = require('../interpreter/VarCheckState.js')

	const { buildAst } = require('../../src/ast/AstBuilder.js').AstBuilder

	function parse (source) {
		const tokens = espace.Tokenizer()(source)
		const rawTree = espace.Parser.parse(tokens)
		return buildAst(rawTree)
	}

	function _t (source) {
		return parse(source).accept(
			new StaticCheck(),
			new VarCheckState(Env.Emp, null)
		)
	}

	module('var checker: references')

	test('Basic tests', function () {
		ok(_t('#f'), '#f')
		ok(_t('424'), 'num')
		ok(_t('(+ 30 12)'), '+')
		ok(_t('(let ((a 10)) (- a 10))'), 'let -')
		ok(_t('(let ((b 10)) (fun f (a) (+ a b)))'), 'let fun +')
		ok(_t('(fun f (a) (call f a))'), 'fun call')
	})

	test('Exceptions', function () {
		throws(function () { return _t('a') }, 'var')
		throws(function () { return _t('(let ((a 10)) b)') }, 'let var')
		throws(function () { return _t('(fun f (a) (+ a b))') }, 'fun +')
		throws(function () { return _t('(lambda (x) (call f x))') }, 'lambda call')
		throws(function () { return _t('(set! a 10 (+ 10 10))') }, 'set!')
		throws(function () { return _t('(setfst! a 10 (+ 10 10))') }, 'setfst!')
		throws(function () { return _t('(setsnd! a 10 (+ 10 10))') }, 'setsnd!')
	})

	test('Let exceptions', function () {
		throws(function () { return _t('(let ((a 10)) (+ a unit))') }, 'let num + var unit')
		throws(function () { return _t('(let a unit (+ a 10))') }, 'let unit + var num')
		_t('(let ((a 10) (b (+ a 10))) (+ b 10))'); ok(true, 'let multiple 1')
		throws(function () { return _t('(let ((a #f) (b (if #t a #f))) (+ b 10))') }, 'let multiple 2')
	})

	test('Naming constraints', function () {
		throws(function () { return _t('(contains? (record (a 10)) m.f)') }, 'contains? 1')
		throws(function () { return _t('(contains? (record (a 10)) m.g)') }, 'contains? 2')
		throws(function () { return _t('(def a.f (lambda (x) x))') }, 'def')
		throws(function () { return _t('(deref unit m.f)') }, 'deref')
		throws(function () { return _t('(fun m.f (x) x)') }, 'fun')
		throws(function () { return _t('(fun f (x.t) 10)') }, 'fun parameter')
		throws(function () { return _t('(lambda (x.t) 10)') }, 'lambda parameter')
		throws(function () { return _t('(let m.f 10 15)') }, 'let')
		throws(function () { return _t('(fun m.f (x) x)') }, 'fun')
		throws(function () { return _t('(record (m.f 10))') }, 'record 1')
		throws(function () { return _t('(record (a 10) (m.f 15))') }, 'record 2')
		throws(function () { return _t('(set m.f 10 15)') }, 'set')
		throws(function () { return _t('(setfst m.f 10 15)') }, 'setfst')
		throws(function () { return _t('(setsnd m.f 10 15)') }, 'setsnd')
	})

	test('Mut and Let', function () {
		_t('(mut a 10 (set! a 20 (+ a a)))'); ok(true, 'mut set +')
		throws(function () { return _t('(let ((a 10)) (set! a 20 (+ a a)))') }, 'let set +')
		throws(function () { return _t('(lambda (x) (set! x 20 (+ x x)))') }, 'lambda set +')
		throws(function () { return _t('(fun f (x) (set! f 20 (+ x x)))') }, 'fun set +')
		_t('(letrec ((a 10)) (+ a 10))'); ok(true, 'letrec num +')
		throws(function () { return _t('(letrec ((a unit)) (+ a 10))') }, 'letrec unit +')
		_t('(letrec ((a 10) (b a)) (+ b 10))'); ok(true, 'letrec num var +')
		_t('(letrec ((a b) (b a)) (+ b 10))'); ok(true, 'letrec var var +')
	})
})()
