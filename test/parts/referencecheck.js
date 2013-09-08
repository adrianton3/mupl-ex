(function() {
	"use strict";
	
	var Tokenizer = require('../tokenizer/Tokenizer.js').Tokenizer;
	var TokEnd = require('../tokenizer/TokEnd.js').TokEnd;
	var TokNum = require('../tokenizer/TokNum.js').TokNum;
	var TokIdentifier = require('../tokenizer/TokIdentifier.js').TokIdentifier;
	var TokBool = require('../tokenizer/TokBool.js').TokBool;
	var TokStr = require('../tokenizer/TokStr.js').TokStr;
	var TokCommSL = require('../tokenizer/TokCommSL.js').TokCommSL;
	var TokCommML = require('../tokenizer/TokCommML.js').TokCommML;
	var TokLPar = require('../tokenizer/TokLPar.js').TokLPar;
	var TokRPar = require('../tokenizer/TokRPar.js').TokRPar;
	var TokKeyword = require('../tokenizer/TokKeyword.js').TokKeyword;
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
	
	var VarBinding = require('../interpreter/VarBinding.js').VarBinding;
	var Env = require('../interpreter/Env.js').Env;
	
	var StaticCheck = require('../interpreter/StaticCheck.js').StaticCheck;
	var VarCheckState = require('../interpreter/VarCheckState.js').VarCheckState;
	var ToJS = require('../interpreter/ToJS.js').ToJS;
	
	var RDP = require('../parser/RDP.js').RDP;
	var Type = require('../interpreter/types/Type.js').Type;
	
	var _l = function(s) { return Tokenizer.chop(s); };
	var _p = function(s) { return RDP.single(Tokenizer.chop(s)); };
	var _e = function(s, modSet) { 
		if(arguments.length > 1) return RDP.single(Tokenizer.chop(s)).ev(Env.Emp, modSet);
		else return RDP.single(Tokenizer.chop(s)).ev(Env.Emp); 
	};
	var _ej = function(s) { return eval(s); };
	var _t = function(s) { return RDP.single(Tokenizer.chop(s)).accept(new StaticCheck(), new VarCheckState(Env.Emp, null)); };
	var _m = function(s) { return RDP.tree(Tokenizer.chop(s)); };
	
	var _tr = function(s) { 
		var exp = RDP.single(Tokenizer.chop(s)).ev(Env.Emp); 
		return ToJS.header() + '\n\n' + exp.accept(new ToJS()); 
	};
	var _eqnj = function(s) { return _e(s).getValue() == _ej(_tr(s)); };
	
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
	
	
	module('var checker: references');
	test('Basic tests', function() {
		ok(_t('#f'), '#f');
		ok(_t('424'), 'num');
		ok(_t('(+ 30 12)'), '+');
		ok(_t('(let a 10 (- a 10))'), 'let -');
		ok(_t('(let b 10 (fun f (a) (+ a b)))'), 'let fun +');
		ok(_t('(fun f (a) (call f a))'), 'fun call');
	});
	
	test('Exceptions', function() {
		throws(function() { return _t('a'); }, 'var');
		throws(function() { return _t('(let a 10 b)'); }, 'let var');
		throws(function() { return _t('(fun f (a) (+ a b))'); }, 'fun +');
		throws(function() { return _t('(lambda (x) (call f x))'); }, 'lambda call');
		throws(function() { return _t('(set! a 10 (+ 10 10))'); }, 'set!');
		throws(function() { return _t('(setfst! a 10 (+ 10 10))'); }, 'setfst!');
		throws(function() { return _t('(setsnd! a 10 (+ 10 10))'); }, 'setsnd!');
	});
	
	test('Let exceptions', function() {
		throws(function() { return _t('(let a 10 (+ a unit))'); }, 'let num + var unit');
		throws(function() { return _t('(let a unit (+ a 10))'); }, 'let unit + var num');
		_t('(let* ((a 10) (b (+ a 10))) (+ b 10))'); ok(true, 'let* 1');
		throws(function() { return _t('(let* ((a #f) (b (if #t a #f))) (+ b 10))'); }, 'let* 2');
	});
	
	test('Naming constraints', function() {
		throws(function() { return _t('(contains? (record (a 10)) m.f)'); }, 'contains? 1');
		throws(function() { return _t('(contains? (record (a 10)) m.g)'); }, 'contains? 2');
		throws(function() { return _t('(def a.f (lambda (x) x))'); }, 'def');
		throws(function() { return _t('(deref unit m.f)'); }, 'deref');
		throws(function() { return _t('(fun m.f (x) x)'); }, 'fun');
		throws(function() { return _t('(fun f (x.t) 10)'); }, 'fun parameter');
		throws(function() { return _t('(lambda (x.t) 10)'); }, 'lambda parameter');
		throws(function() { return _t('(let m.f 10 15)'); }, 'let');
		throws(function() { return _t('(fun m.f (x) x)'); }, 'fun');
		throws(function() { return _t('(record (m.f 10))'); }, 'record 1');
		throws(function() { return _t('(record (a 10) (m.f 15))'); }, 'record 2');
		throws(function() { return _t('(set m.f 10 15)'); }, 'set');
		throws(function() { return _t('(setfst m.f 10 15)'); }, 'setfst');
		throws(function() { return _t('(setsnd m.f 10 15)'); }, 'setsnd');
	});
	
	test('Mut and Let', function() {
		_t('(mut a 10 (set! a 20 (+ a a)))'); ok(true,'mut set +');
		throws(function() { return _t('(let a 10 (set! a 20 (+ a a)))'); }, 'let set +');
		throws(function() { return _t('(lambda (x) (set! x 20 (+ x x)))'); }, 'lambda set +');
		throws(function() { return _t('(fun f (x) (set! f 20 (+ x x)))'); }, 'fun set +');
		_t('(letrec ((a 10)) (+ a 10))'); ok(true,'letrec num +');
		throws(function() { return _t('(letrec ((a unit)) (+ a 10))'); }, 'letrec unit +');
		_t('(letrec ((a 10) (b a)) (+ b 10))'); ok(true,'letrec num var +');
		_t('(letrec ((a b) (b a)) (+ b 10))'); ok(true,'letrec var var +');
	});
})();