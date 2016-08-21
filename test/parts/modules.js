(function() {
	"use strict";

	const { buildAst, buildModuleAst } = require('../../src/ast/AstBuilder.js').AstBuilder
	
	var Add = require('../interpreter/nodes/Add.js').Add;
	var And = require('../interpreter/nodes/And.js').And;
	var Bool = require('../interpreter/nodes/Bool.js').Bool;
	var BoolQ = require('../interpreter/nodes/BoolQ.js').BoolQ;
	var Call = require('../interpreter/nodes/Call.js').Call;
	var ClosureQ = require('../interpreter/nodes/ClosureQ.js').ClosureQ;
	var ContainsQ = require('../interpreter/nodes/ContainsQ.js').ContainsQ;
	var Def = require('../interpreter/nodes/Def.js').Def;
	var Div = require('../interpreter/nodes/Div.js').Div;
	var Fst = require('../interpreter/nodes/Fst.js').Fst;
	var Fun = require('../interpreter/nodes/Fun.js').Fun;
	var If = require('../interpreter/nodes/If.js').If;
	var Let = require('../interpreter/nodes/Let.js').Let;
	var Mod = require('../interpreter/nodes/Mod.js').Mod;
	var Module = require('../interpreter/Module.js').Module;
	var ModuleSet = require('../interpreter/ModuleSet.js').ModuleSet;
	var Mul = require('../interpreter/nodes/Mul.js').Mul;
	var Not = require('../interpreter/nodes/Not.js').Not;
	var Num = require('../interpreter/nodes/Num.js').Num;
	var NumQ = require('../interpreter/nodes/NumQ.js').NumQ;
	var Or = require('../interpreter/nodes/Or.js').Or;
	var Pair = require('../interpreter/nodes/Pair.js').Pair;
	var PairQ = require('../interpreter/nodes/PairQ.js').PairQ;
	var Record = require('../interpreter/nodes/Record.js').Record;
	var RecordQ = require('../interpreter/nodes/RecordQ.js').RecordQ;
	var Snd = require('../interpreter/nodes/Snd.js').Snd;
	var Str = require('../interpreter/nodes/Str.js').Str;
	var StrQ = require('../interpreter/nodes/StrQ.js').StrQ;
	var Sub = require('../interpreter/nodes/Sub.js').Sub;
	var Unit = require('../interpreter/nodes/Unit.js').Unit;
	var UnitQ = require('../interpreter/nodes/UnitQ.js').UnitQ;
	var Var = require('../interpreter/nodes/Var.js').Var;
	var Xor = require('../interpreter/nodes/Xor.js').Xor;
	
	var VarBinding = require('../interpreter/VarBinding.js').VarBinding;
	var Env = require('../interpreter/Env.js').Env;
	
	var StaticCheck = require('../interpreter/StaticCheck.js').StaticCheck;
	var VarCheckState = require('../interpreter/VarCheckState.js').VarCheckState;
	var ToJS = require('../interpreter/ToJS.js').ToJS;
	
	var Type = require('../interpreter/types/Type.js').Type;

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

	test('Simple calls', function() {
		var modSet = _m('(module m (public f (lambda (x) (* x x))) (public g (lambda (x) (+ x 10))))')
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
	
	test('Environment reset', function() {
		var modSet = _m('(module m (public f (lambda (x) (* x a))))')
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