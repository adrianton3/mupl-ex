(function() {
	"use strict";
	
	var Tokenizer = require('../tokenizer/Tokenizer.js').Tokenizer;
	var TokenCoords = require('../tokenizer/TokenCoords.js').TokenCoords;
	
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
	
	var Env = require('../interpreter/Env.js').Env;
	
	var StaticCheck = require('../interpreter/StaticCheck.js').StaticCheck;
	var VarCheckState = require('../interpreter/VarCheckState.js').VarCheckState;
	
	var RDP = require('../parser/RDP.js').RDP;
	var Type = require('../interpreter/types/Type.js').Type;
	
	var _t = function(s) { return RDP.single(Tokenizer.chop(s)).accept(new StaticCheck(), new VarCheckState(Env.Emp, null)); };

	var _tvid     = new Type(false, false, false, false, false, false, false, false);
	var _tany     = new Type( true, false, false, false, false, false, false, false);
	var _tbool    = new Type(false,  true, false, false, false, false, false, false);
	var _tnum     = new Type(false, false,  true, false, false, false, false, false);
	var _tstr     = new Type(false, false, false,  true, false, false, false, false);
	var _tunit    = new Type(false, false, false, false,  true, false, false, false);
	var _tpair    = new Type(false, false, false, false, false,  true, false, false);
	var _trecord  = new Type(false, false, false, false, false, false,  true, false);
	var _tfun     = new Type(false, false, false, false, false, false, false, _tvid);
	var _tfun_num = new Type(false, false, false, false, false, false, false, _tnum);

	module('type checker');
	test('Basic type eval', function() {
		ok(_t('#f').equals(_tbool), 'TypeBool');
		ok(_t('234').equals(_tnum), 'TypeNum');
		ok(_t('unit').equals(_tunit), 'TypeUnit');
		ok(_t('(fun f (x) 10)').equals(
			new Type(false, false, false, false, false, false, false, 
				new Type(false, false, true, false, false, false, false, false))), 'TypeFun');
		ok(_t('(pair 10 20)').equals(_tpair), 'TypePair');
		ok(_t('(record (a 10) (y 20))').equals(_trecord), 'TypeRecord');
	});
	
	test('Type eval', function() {
		ok(_t('(and #t #f)').equals(_tbool), 'and');
		ok(_t('(+ 10 20)').equals(_tnum), '+');
		ok(_t('(fst (pair 10 #f))').equals(_tnum), 'fst pair');
		ok(_t('(snd (pair 10 #f))').equals(_tbool), 'snd pair');
		ok(_t('(if #t 10 20)').equals(_tnum), 'if num num');
		ok(_t('(if #t 10 #f)').equals(_tnum.or(_tbool)), 'if num bool');
		ok(_t('(if #t #f #t)').equals(_tbool), 'if bool bool');
	});
	
	test('Fun type eval', function() {
		ok(_t('(call (lambda (x) (and x #f)) #t)').equals(_tbool), 'call lambda and');
		ok(_t('(call (lambda (x y) (+ x y)) 4 7)').equals(_tnum), 'call lambda lambda +');
		ok(_t('(call (lambda (x y) (+ x y)) 4)').equals(_tfun_num), 'call lambda lambda +');
		throws(function() { return _t('(call (lambda (x) (and x #f)) #t #f)'); }, 'call call lambda and');
	});
	
	test('Exceptions', function() {
		throws(function() { return _t('(if 4 10 20)'); }, 'if');
		
		throws(function() { return _t('(num? (if 4 10 20))'); }, 'num? if num num num');
		throws(function() { return _t('(+ 4 #f)'); }, '+');
		throws(function() { return _t('(- #t #f)'); }, '-');
		throws(function() { return _t('(* unit 5)'); }, '*');
		throws(function() { return _t('(/ v unit)'); }, '/');
		throws(function() { return _t('(% 4 (pair 1 2))'); }, '%');
		
		throws(function() { return _t('(bool? (if 4 10 20))'); }, 'bool? if num num num');
		throws(function() { return _t('(not 1)'); }, 'and');
		throws(function() { return _t('(and 4 #f)'); }, 'and');
		throws(function() { return _t('(or unit #t)'); }, 'or');
		throws(function() { return _t('(xor (pair 10 30) (pair 20 40))'); }, 'xor');
		
		throws(function() { return _t('(pair? (if 4 10 20))'); }, 'pair? if num num num');
		throws(function() { return _t('(pair (if 4 10 20) 30)'); }, 'pair (if num num num) num');
		throws(function() { return _t('(pair 30 (if 4 10 20))'); }, 'pair num (if num num num)');
		throws(function() { return _t('(fst 90)'); }, 'fst num');
		throws(function() { return _t('(fst (if #f 30 40))'); }, 'fst if num num');
		throws(function() { return _t('(snd (if #f #f #f))'); }, 'snd if bool bool');
		
		throws(function() { return _t('(let x 40 (if 4 10 20))'); }, 'let num (if num num num)');
		throws(function() { return _t('(let x (if 4 10 20) 40)'); }, 'let (if num num num) num');
	});
})();