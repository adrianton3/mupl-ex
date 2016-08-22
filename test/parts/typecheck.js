(function () {
	"use strict"

	const Env = require('../interpreter/Env.js').Env

	const StaticCheck = require('../interpreter/StaticCheck.js').StaticCheck
	const VarCheckState = require('../interpreter/VarCheckState.js').VarCheckState

	const Type = require('../interpreter/types/Type.js').Type

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

	const _tvid = new Type(false, false, false, false, false, false, false, false)
	const _tany = new Type( true, false, false, false, false, false, false, false)
	const _tbool = new Type(false, true, false, false, false, false, false, false)
	const _tnum = new Type(false, false, true, false, false, false, false, false)
	const _tstr = new Type(false, false, false, true, false, false, false, false)
	const _tunit = new Type(false, false, false, false, true, false, false, false)
	const _tpair = new Type(false, false, false, false, false, true, false, false)
	const _trecord = new Type(false, false, false, false, false, false, true, false)
	const _tfun = new Type(false, false, false, false, false, false, false, _tvid)
	const _tfun_num = new Type(false, false, false, false, false, false, false, _tnum)

	module('type checker')

	test('Basic type eval', function () {
		ok(_t('#f').equals(_tbool), 'TypeBool')
		ok(_t('234').equals(_tnum), 'TypeNum')
		ok(_t('unit').equals(_tunit), 'TypeUnit')
		ok(_t('(fun f (x) 10)').equals(
			new Type(false, false, false, false, false, false, false,
				new Type(false, false, true, false, false, false, false, false))), 'TypeFun')
		ok(_t('(pair 10 20)').equals(_tpair), 'TypePair')
		ok(_t('(record (a 10) (y 20))').equals(_trecord), 'TypeRecord')
	})

	test('Type eval', function () {
		ok(_t('(and #t #f)').equals(_tbool), 'and')
		ok(_t('(+ 10 20)').equals(_tnum), '+')
		ok(_t('(fst (pair 10 #f))').equals(_tnum), 'fst pair')
		ok(_t('(snd (pair 10 #f))').equals(_tbool), 'snd pair')
		ok(_t('(if #t 10 20)').equals(_tnum), 'if num num')
		ok(_t('(if #t 10 #f)').equals(_tnum.or(_tbool)), 'if num bool')
		ok(_t('(if #t #f #t)').equals(_tbool), 'if bool bool')
	})

	test('Fun type eval', function () {
		ok(_t('(call (lambda (x) (and x #f)) #t)').equals(_tbool), 'call lambda and')
		ok(_t('(call (lambda (x y) (+ x y)) 4 7)').equals(_tnum), 'call lambda lambda +')
		ok(_t('(call (lambda (x y) (+ x y)) 4)').equals(_tfun_num), 'call lambda lambda +')
		throws(function () { return _t('(call (lambda (x) (and x #f)) #t #f)') }, 'call call lambda and')
	})

	test('Exceptions', function () {
		throws(function () { return _t('(if 4 10 20)') }, 'if')

		throws(function () { return _t('(num? (if 4 10 20))') }, 'num? if num num num')
		throws(function () { return _t('(+ 4 #f)') }, '+')
		throws(function () { return _t('(- #t #f)') }, '-')
		throws(function () { return _t('(* unit 5)') }, '*')
		throws(function () { return _t('(/ v unit)') }, '/')
		throws(function () { return _t('(% 4 (pair 1 2))') }, '%')

		throws(function () { return _t('(bool? (if 4 10 20))') }, 'bool? if num num num')
		throws(function () { return _t('(not 1)') }, 'and')
		throws(function () { return _t('(and 4 #f)') }, 'and')
		throws(function () { return _t('(or unit #t)') }, 'or')
		throws(function () { return _t('(xor (pair 10 30) (pair 20 40))') }, 'xor')

		throws(function () { return _t('(pair? (if 4 10 20))') }, 'pair? if num num num')
		throws(function () { return _t('(pair (if 4 10 20) 30)') }, 'pair (if num num num) num')
		throws(function () { return _t('(pair 30 (if 4 10 20))') }, 'pair num (if num num num)')
		throws(function () { return _t('(fst 90)') }, 'fst num')
		throws(function () { return _t('(fst (if #f 30 40))') }, 'fst if num num')
		throws(function () { return _t('(snd (if #f #f #f))') }, 'snd if bool bool')

		throws(function () { return _t('(let x 40 (if 4 10 20))') }, 'let num (if num num num)')
		throws(function () { return _t('(let x (if 4 10 20) 40)') }, 'let (if num num num) num')
	})
})()
