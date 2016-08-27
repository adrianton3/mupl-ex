(function () {
	"use strict"

	const { buildAst, buildModuleAst } = require('../../src/ast/AstBuilder.js').AstBuilder

	const { ModuleSet } = require('../interpreter/ModuleSet.js')
	const { Num } = require('../interpreter/nodes/Num.js')

	const { Env } = require('../interpreter/Env.js')

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
