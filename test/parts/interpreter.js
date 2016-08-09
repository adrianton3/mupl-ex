(function() {
	"use strict";
	
	var Tokenizer = require('../tokenizer/Tokenizer.js').Tokenizer;
	
	var Bool = require('../interpreter/nodes/Bool.js').Bool;
	var Num = require('../interpreter/nodes/Num.js').Num;
	var Pair = require('../interpreter/nodes/Pair.js').Pair;
	var Record = require('../interpreter/nodes/Record.js').Record;
	var Str = require('../interpreter/nodes/Str.js').Str;
	var Unit = require('../interpreter/nodes/Unit.js').Unit;
	var Var = require('../interpreter/nodes/Var.js').Var;
	
	var VarBinding = require('../interpreter/VarBinding.js').VarBinding;
	var Env = require('../interpreter/Env.js').Env;

	const { buildAst } = require('../../src/ast/AstBuilder.js').AstBuilder

	function parse (source) {
		const tokens = espace.Tokenizer()(source)
		const rawTree = espace.Parser.parse(tokens)
		return buildAst(rawTree)
	}

	function _e(source, modSet) {
		return arguments.length > 1 ?
			parse(source).ev(Env.Emp, modSet) :
			parse(source).ev(Env.Emp)
	}
	
	module('interpreter')

	test('Atomic trees', function() {
		deepEqual(new Num(234).ev(Env.Emp), new Num(234), 'Num');
		deepEqual(new Bool(true).ev(Env.Emp), new Bool(true), 'Bool');
		deepEqual(new Unit().ev(Env.Emp), new Unit(), 'Unit');
	});
	
	test('Math ops', function() {
		deepEqual(_e('(+ 15 20)'), new Num(15 + 20), 'Add');
		deepEqual(_e('(- 15 20)'), new Num(15 - 20), 'Sub');
		deepEqual(_e('(* 15 20)'), new Num(15 * 20), 'Mul');
		deepEqual(_e('(/ 15 20)'), new Num(15 / 20), 'Div');
		deepEqual(_e('(% 15 20)'), new Num(15 % 20), 'Mod');
	});
	
	test('Bool ops', function() {
		deepEqual(_e('(not #f)'), new Bool(true), 'Not');
		deepEqual(_e('(not #t)'), new Bool(false), 'Not');
		deepEqual(_e('(and #f #t)'), new Bool(false), 'And');
		deepEqual(_e('(and #t #t)'), new Bool(true), 'And');
		deepEqual(_e('(or #f #t)'), new Bool(true), 'Or');
		deepEqual(_e('(or #f #f)'), new Bool(false), 'Or');
		deepEqual(_e('(xor #t #t)'), new Bool(false), 'Xor');
	});
	
	test('Pair', function() {
		deepEqual(_e('(fst (pair 15 20))'), new Num(15), 'Fst');
		deepEqual(_e('(snd (pair 15 20))'), new Num(20), 'Snd');
		deepEqual(_e('(snd (fst (pair (pair 15 20) 25)))'), new Num(20), 'Snd fst');
	});
	
	test('Qs', function() {
		deepEqual(_e('(unit? (pair 15 20))'), new Bool(false), 'Unit?');
		deepEqual(_e('(unit? unit)'), new Bool(true), 'Unit?');
		deepEqual(_e('(num? 234)'), new Bool(true), 'Num?');
		deepEqual(_e('(num? unit)'), new Bool(false), 'Num?');
		deepEqual(_e('(bool? (pair 15 20))'), new Bool(false), 'Bool?');
		deepEqual(_e('(bool? #t)'), new Bool(true), 'Bool?');
		deepEqual(_e('(pair? (pair 15 20))'), new Bool(true), 'Pair?');
		deepEqual(_e('(pair? unit)'), new Bool(false), 'Pair?');
		deepEqual(_e('(record? (pair 15 20))'), new Bool(false), 'Record?');
		deepEqual(_e('(record? (record (a 11) (b 22)))'), new Bool(true), 'Record?');
		deepEqual(_e('(closure? (pair 15 20))'), new Bool(false), 'Closure?');
		deepEqual(_e('(closure? (lambda () (pair 15 20)))'), new Bool(true), 'Closure?');
	});
	
	test('Scope', function() {
		deepEqual(new Var('a').ev(new Env(new VarBinding('a', new Num(10)))), new Num(10), 'Simple lookup');
		deepEqual(new Var('a').ev(new Env(new VarBinding('a', new Num(10))).con(new VarBinding('a', new Num(20)))), new Num(20), 'Shadowing');
		deepEqual(_e('(let ((a 10)) a)'), new Num(10), 'Let');
		deepEqual(_e('(let ((a 10) (a 20)) a)'), new Num(20), 'Let');
	});
	
	test('Record', function() {
		deepEqual(_e('(deref (record (x 10) (y 20) (z 30)) x)'), new Num(10), 'Deref');
		deepEqual(_e('(deref (record (x 10) (y 20) (z 30)) y)'), new Num(20), 'Deref');
		deepEqual(_e('(deref (record (x 10) (y 20) (z 30)) z)'), new Num(30), 'Deref');
	});
	
	test('Fun', function() {
		deepEqual(_e(
			`(call 
				(fun f (x) 
					(+ 10 x)) 5)`
		), new Num(15), 'Fun')

		deepEqual(_e(
			`(let 
				((a 10)) 
				(call (fun f (x) (+ a x)) 5))`
		), new Num(15), 'Closure')

		deepEqual(_e(
			`(let 
				((a 10) 
				(f (lambda (x) (+ a x)))
				(a 30)) 
				(call f 5))`
		), new Num(15), 'Closure scope')
	});
	
	test('Set!', function() {
		deepEqual(_e('(mut a 15 (set! a 33 a))'), new Num(33), 'Set!');
		deepEqual(_e('(let ((a (pair 11 22))) (setfst! a 33 (fst a)))'), new Num(33), 'SetFst!');
		deepEqual(_e('(let ((a (pair 11 22))) (setfst! a 33 (snd a)))'), new Num(22), 'SetFst!');
		deepEqual(_e('(let ((a (pair 11 22))) (setsnd! a 33 (snd a)))'), new Num(33), 'SetSnd!');
		deepEqual(_e('(let ((a (pair 11 22))) (setsnd! a 33 (fst a)))'), new Num(11), 'SetSnd!');
	});
	
	test('Extendables', function() {
		deepEqual(_e('(cond ((#t 10) (#t 20)) 30)'), new Num(10), 'Cond');
		deepEqual(_e('(cond ((#f 10) (#t 20)) 30)'), new Num(20), 'Cond');
		deepEqual(_e('(cond ((#f 10) (#f 20)) 30)'), new Num(30), 'Cond');
		
		deepEqual(_e('(let ((a 10) (b 20)) a)'), new Num(10), 'Let');
		deepEqual(_e('(let ((a 10) (a 20)) a)'), new Num(20), 'Let');
		deepEqual(_e('(let ((a 10) (b a)) b)'), new Num(10), 'Let');
		
		deepEqual(_e('(list 11 22 33 44 55)'), 
			new Pair(new Num(11), new Pair(new Num(22), new Pair(new Num(33), new Pair(new Num(44), new Pair(new Num(55), new Unit()))))), 'List');
		deepEqual(_e('(list 11)'), new Pair(new Num(11), new Unit()), 'Short list');
		deepEqual(_e('(list)'), new Unit(), 'Shortest list');
		
		deepEqual(_e('(call (fun f (a b) (+ a b)) 11 22)'), new Num(33), 'Call(Fun)');
		deepEqual(_e('(let ((c (call (fun f (a b) (+ a b)) 11))) (call c 22))'), new Num(33), 'Call(Fun)');
		
		deepEqual(_e('(call (lambda (a b) (+ a b)) 11 22)'), new Num(33), 'Call(Lambda)');
		
		deepEqual(_e('(letrec ((a c) (b 22) (c b)) c)'), new Num(22), 'Letrec');
	});
})();
