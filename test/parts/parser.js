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
	
	var RDP = require('../parser/RDP.js').RDP;
	
	var _l = function(s) { return Tokenizer.chop(s); };
	var _p = function(s) { return RDP.single(Tokenizer.chop(s)); };
	
	module('parser');
	test('Atomic expressions', function() {
		deepEqual(_p('234'), new Num(234), 'Number');
		deepEqual(_p('#t'), new Bool(true), 'Bool true');
		deepEqual(_p('#f'), new Bool(false), 'Bool false');
		deepEqual(_p('unit'), new Unit(), 'Unit');
	});
	
	test('Simple expressions', function() {
		deepEqual(_p('234'), new Num(234, new TokenCoords(0, 0)), 'Num');
		deepEqual(_p('asd'), new Var('asd', new TokenCoords(0, 0)), 'Var');
		
		deepEqual(_p('(if #t 11 22)'), new If(new Bool(true, new TokenCoords(0, 4)), 
		                                      new Num(11, new TokenCoords(0, 7)), 
		                                      new Num(22, new TokenCoords(0, 10)), 
		                                      new TokenCoords(0, 1)), 'If');
		
		deepEqual(_p('(unit? unit)'), new UnitQ(new Unit()), 'unit? unit');
		deepEqual(_p('(bool? 234)'), new BoolQ(new Num(234, new TokenCoords(0, 7)), new TokenCoords(0, 1)), 'bool? 234');
		deepEqual(_p('(num? #f)'), new NumQ(new Bool(false, new TokenCoords(0, 6)), new TokenCoords(0, 1)), 'num? bool');
		
		deepEqual(_p('(pair 11 22)'), new Pair(new Num(11, new TokenCoords(0, 6)), 
		                                       new Num(22, new TokenCoords(0, 9)), 
		                                       new TokenCoords(0, 1)), 'pair num num');
		deepEqual(_p('(pair? (pair 11 22))'), new PairQ(new Pair(new Num(11, new TokenCoords(0, 13)), 
		                                                         new Num(22, new TokenCoords(0, 16)),
		                                                         new TokenCoords(0, 8)), 
		                                                new TokenCoords(0, 1)), 'pair? pair num num');
		deepEqual(_p('(fst (pair 11 22))'), new Fst(new Pair(new Num(11, new TokenCoords(0, 11)), 
		                                                     new Num(22, new TokenCoords(0, 14)),
		                                                     new TokenCoords(0, 6)), 
		                                            new TokenCoords(0, 1)), 'fst pair num num');
		deepEqual(_p('(snd (pair 11 22))'), new Snd(new Pair(new Num(11, new TokenCoords(0, 11)), 
		                                                     new Num(22, new TokenCoords(0, 14)),
		                                                     new TokenCoords(0, 6)), 
		                                            new TokenCoords(0, 1)), 'snd pair num num');
	});
})();