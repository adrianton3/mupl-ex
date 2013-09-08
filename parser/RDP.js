exports.RDP = (function () {
	"use strict";
	
	var TokEnd = require('../tokenizer/TokEnd.js').TokEnd;
	var TokNum = require('../tokenizer/TokNum.js').TokNum;
	var TokIdentifier = require('../tokenizer/TokIdentifier.js').TokIdentifier;
	var TokBool = require('../tokenizer/TokBool.js').TokBool;
	var TokStr = require('../tokenizer/TokStr.js').TokStr;
	var TokLPar = require('../tokenizer/TokLPar.js').TokLPar;
	var TokRPar = require('../tokenizer/TokRPar.js').TokRPar;
	var TokenList = require('./TokenList.js').TokenList;
	
	var Add = require('../interpreter/nodes/Add.js').Add;
	var And = require('../interpreter/nodes/And.js').And;
	var ArrJS = require('../interpreter/nodes/ArrJS.js').ArrJS;
	var Bool = require('../interpreter/nodes/Bool.js').Bool;
	var BoolQ = require('../interpreter/nodes/BoolQ.js').BoolQ;
	var Call = require('../interpreter/nodes/Call.js').Call;
	var CallJS = require('../interpreter/nodes/CallJS.js').CallJS;
	var ClosureQ = require('../interpreter/nodes/ClosureQ.js').ClosureQ;
	var ContainsQ = require('../interpreter/nodes/ContainsQ.js').ContainsQ;
	var Def = require('../interpreter/nodes/Def.js').Def;
	var Deref = require('../interpreter/nodes/Deref.js').Deref;
	var Div = require('../interpreter/nodes/Div.js').Div;
	var Fun = require('../interpreter/nodes/Fun.js').Fun;
	var Fst = require('../interpreter/nodes/Fst.js').Fst;
	var Greater = require('../interpreter/nodes/Greater.js').Greater;
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
	var Set = require('../interpreter/nodes/Set.js').Set;
	var SetFst = require('../interpreter/nodes/SetFst.js').SetFst;
	var SetSnd = require('../interpreter/nodes/SetSnd.js').SetSnd;
	var Snd = require('../interpreter/nodes/Snd.js').Snd;
	var Str = require('../interpreter/nodes/Str.js').Str;
	var StrQ = require('../interpreter/nodes/StrQ.js').StrQ;
	var Sub = require('../interpreter/nodes/Sub.js').Sub;
	var Unit = require('../interpreter/nodes/Unit.js').Unit;
	var UnitQ = require('../interpreter/nodes/UnitQ.js').UnitQ;
	var Var = require('../interpreter/nodes/Var.js').Var;
	var Xor = require('../interpreter/nodes/Xor.js').Xor;
	
	var Any = require('../interpreter/nodes/Any.js').Any;
	
	var RDP = { };
	
	RDP.errPref = 'Parsing exception: ';
	
	RDP.tree = function(tokenar) {
		var token = new TokenList(tokenar);
		var modSet = RDP.tree.start(token);
		token.expect(new TokEnd(), 'RDP: expression not properly terminated');
		return modSet;
	};
	
	RDP.single = function(tokenar) {
		var token = new TokenList(tokenar);
		var t = RDP.tree.exp(token);
		token.expect(new TokEnd(), 'RDP: expression not properly terminated');
		return t;
	};
	
	RDP.tree.num = new TokNum();
	RDP.tree.identifier = new TokIdentifier();
	RDP.tree.bool = new TokBool();
	RDP.tree.str = new TokStr();
	
	RDP.tree.lPar = new TokLPar();
	RDP.tree.rPar = new TokRPar();
	
	RDP.tree.start = function(token) {
		var ret = [];
		while(token.match(RDP.tree.lPar)) {
			token.adv();
			token.expect('module', 'RDP: module expected');
			token.expect(RDP.tree.identifier, 'RDP: module name expected');
			var name = token.past().s;
			var list = RDP.tree.defList(token, name);
			token.expect(RDP.tree.rPar, 'RDP: mod: Missing rpar');
			
			ret.push(new Module(name, list));
		}
		return new ModuleSet(ret);
	};
	
	RDP.tree.defList = function(token, modName) {
		var ret = [];
		while(token.match(RDP.tree.lPar)) {
			token.adv();
			
			var pub;
			if(token.match('public')) pub = true;
			else if(token.match('private')) pub = false;
			else throw 'RDP: def can be either public or private';
			token.adv();
			
			token.expect(RDP.tree.identifier, 'RDP: def name expected');
			var defName = token.past().s;
			
			token.expect(RDP.tree.lPar, 'RDP: def: Missing lpar');
		
			var fun;
			if(token.match('fun')) {
				token.adv();
				fun = RDP.tree.special._funStar(token);
			}
			else if(token.match('lambda')) {
				token.adv();
				fun = RDP.tree.special._lambdaStar(token);
			}
			else throw 'RDP: def can bind only functions';
			
			ret.push(new Def(defName, modName, pub, fun));
			token.expect(RDP.tree.rPar, 'RDP: def: Missing rpar');
		}
		return ret;
	};
	
	RDP.tree.exp = function(token) {
		if(token.match(RDP.tree.lPar)) {
			token.adv();
			return RDP.tree.special(token);
		}
		else if(token.match(RDP.tree.bool)) {
			var tmp = token.next();
			if(tmp.s == '#t') return new Bool(true);
			else return new Bool(false);
		}
		else if(token.match(RDP.tree.num)) {
			return new Num(token.next().n);
		}
		else if(token.match(RDP.tree.str)) {
			return new Str(token.next().s);
		}
		else if(token.match('unit')) {
			token.adv();
			return new Unit();
		}
		else if(token.match(RDP.tree.identifier)) {
			var vTok = token.next();
			return new Var(vTok.s, vTok.coords);
		}
		else
			throw 'RDP: expected expression but got ' + token.cur() + ' ' + token.cur().coords;
	};
	
	RDP.tree.ifList = function(token) {
		var list = [];
		while(!token.match(RDP.tree.rPar)) {
			token.adv();
			var cond = RDP.tree.exp(token);
			var exp = RDP.tree.exp(token);
			token.expect(RDP.tree.rPar, 'RDP: iflist: Missing rpar');
			
			list.push(new CondPair(cond, exp));
		}
		return list;
	};
	
	RDP.tree.funParamList = function(token) {
		var list = [];
		while(!token.match(RDP.tree.rPar)) {
			token.expect(RDP.tree.identifier, 'RDP: fun: identifiers expected');
			list.push(token.past().s);
		}
		return list;
	};
	
	RDP.tree.callParamList = function(token) {
		var list = [];
		while(!token.match(RDP.tree.rPar)) {
			var exp = RDP.tree.exp(token);
			list.push(exp);
		}
		return list;
	};
	
	RDP.tree.letList = function(token) {
		var list = [];
		while(!token.match(RDP.tree.rPar)) {
			token.adv();
			token.expect(RDP.tree.identifier, 'RDP: letlist: first parameter must be an identifier');
			var name = token.past().s;
			var exp = RDP.tree.exp(token);
			token.expect(RDP.tree.rPar, 'RDP: letlist: missing rpar');
			
			list.push(new LetStarPair(name, exp));
		}
		return list;
	};
	
	RDP.tree.letrecList = function(token) {
		var list = [];
		while(!token.match(RDP.tree.rPar)) {
			token.adv();
			token.expect(RDP.tree.identifier, 'RDP: letreclist: first parameter must be an identifier');
			var name = token.past().s;
			var exp = RDP.tree.exp(token);
			token.expect(RDP.tree.rPar, 'RDP: letreclist: missing rpar');
			
			list.push(new LetrecStarPair(name, exp));
		}
		return list;
	};
	
	RDP.tree.pairList = function(token) {
		var list = [];
		while(!token.match(RDP.tree.rPar)) {
			var exp = RDP.tree.exp(token);
			list.push(exp);
		}
		return list;
	};
	
	RDP.tree.recordList = function(token) {
		var map = {};
		while(!token.match(RDP.tree.rPar)) {
			token.adv();
			token.expect(RDP.tree.identifier, 'RDP: first record pair member must be an identifier');
			var name = token.past().s;
			var exp = RDP.tree.exp(token);
			token.expect(RDP.tree.rPar, 'RDP: record: Missing rpar');
			
			map[name] = exp;
		}
		return map;
	};
	
	RDP.tree.containsList = function(token) {
		var list = [];
		
		token.expect(RDP.tree.identifier, 'RDP: contains?: identifiers expected');
		list.push(token.past().s);
		
		while(!token.match(RDP.tree.rPar)) {
			token.expect(RDP.tree.identifier, 'RDP: contains?: identifiers expected');
			list.push(token.past().s);
		}
		
		return list;
	};
	
	RDP.tree.arrJSList = function(token) {
		var list = [];
		while(!token.match(RDP.tree.rPar)) {
			var exp = RDP.tree.exp(token);
			list.push(exp);
		}
		return list;
	};
	
	RDP.tree.callJSList = function(token) {
		var list = [];
		while(!token.match(RDP.tree.rPar)) {
			var exp = RDP.tree.exp(token);
			list.push(exp);
		}
		return list;
	};
	
	RDP.tree.special = function(token) {
		for(var i in RDP.tree.special.bindings) {
			if(token.match(RDP.tree.special.bindings[i].s)) {
				token.adv();
				return RDP.tree.special.bindings[i].h(token);
			}
		}
	
		throw 'RDP: unknown function: ' + token.cur();
	};
	//-----------------------------------------------------------------------------
	RDP.tree.special._add = function(token) {
		var addTok = token.past();
		var addE1 = RDP.tree.exp(token);
		var addE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: +: Missing rpar');
		return new Add(addE1, addE2, addTok.coords);
	};
	
	RDP.tree.special._and = function(token) {
		var andTok = token.past();
		var andE1 = RDP.tree.exp(token);
		var andE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: and: Missing rpar');
		return new And(andE1, andE2, andTok.coords);
	};
	
	RDP.tree.special._arrJS = function(token) {
		var arrJSTok = token.past();
		token.expect(RDP.tree.identifier, 'RDP: first arrjs parameter must be an identifier');
		var arrJSName = token.past().s;
		var arrJSList = RDP.tree.arrJSList(token);
		token.expect(RDP.tree.rPar, 'RDP: arrJS: Missing rpar');
		return new ArrJS(arrJSName, arrJSList, arrJSTok.coords);
	};
	
	RDP.tree.special._boolQ = function(token) {
		var boolQTok = token.past();
		var boolQE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: bool?: Missing rpar');
		return new BoolQ(boolQE, boolQTok.coords);
	};
	
	RDP.tree.special._callStar = function(token) {
		var callStarTok = token.past();
		var callCallee = RDP.tree.exp(token);
		var callParamList = RDP.tree.callParamList(token);
		token.expect(RDP.tree.rPar, 'RDP: call*: Missing rpar');
		return callStar(callCallee, callParamList, callStarTok.coords);
	};
	
	RDP.tree.special._callJS = function(token) {
		var callJSTok = token.past();
		token.expect(RDP.tree.identifier, 'RDP: first calljs parameter must be an identifier');
		var callJSName = token.past().s;
		var callJSList = RDP.tree.callJSList(token);
		token.expect(RDP.tree.rPar, 'RDP: calljs: Missing rpar');
		return new CallJS(callJSName, callJSList, callJSTok.coords);
	};
	
	RDP.tree.special._closureQ = function(token) {
		var closureQTok = token.past();
		var closureE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: closure?: Missing rpar');
		return new ClosureQ(closureE, closureQTok.coords);
	};
	
	RDP.tree.special._cond = function(token) {
		var condTok = token.past();
		token.expect(RDP.tree.lPar, 'RDP: cond missing lpar');
		var condList = RDP.tree.ifList(token);
		token.expect(RDP.tree.rPar, 'RDP: cond missing rpar');
		var condDef = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: cond: Missing rpar');
		return cond(condList, condDef, condTok.coords);
	};
	
	RDP.tree.special._containsQ = function(token) {
		var containsQTok = token.past();
		var containsExp = RDP.tree.exp(token);
		var containsList = RDP.tree.containsList(token);
		token.expect(RDP.tree.rPar, 'RDP: contains?: Missing rpar');
		return new ContainsQ(containsExp, containsList, containsQTok.coords);
	};
	
	RDP.tree.special._deref = function(token) {
		var derefTok = token.past();
		var derefExp = RDP.tree.exp(token);
		token.expect(RDP.tree.identifier, 'RDP: second deref parameter must be an identifier');
		var derefName = token.past().s;
		token.expect(RDP.tree.rPar, 'RDP: deref: Missing rpar');
		return new Deref(derefExp, derefName, derefTok, derefTok.coords);
	};
	
	RDP.tree.special._div = function(token) {
		var divTok = token.past();
		var divE1 = RDP.tree.exp(token);
		var divE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: /: Missing rpar');
		return new Div(divE1, divE2, divTok.coords);
	};
	
	RDP.tree.special._err = function(token) {
		var errTok = token.past();
		var errExp = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: err: Missing rpar');
		return new Err(errExp, errTok.coords);
	};
	
	RDP.tree.special._fst = function(token) {
		var fstTok = token.past();
		var fstE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: fst: Missing rpar');
		return new Fst(fstE, fstTok.coords);
	};
	
	RDP.tree.special._funStar = function(token) {
		var funStarTok = token.past();
		token.expect(RDP.tree.identifier, 'RDP: first fun parameter must be an identifier');
		var funName = token.past().s;
		token.expect(RDP.tree.lPar, 'RDP: fun missing lpar');
		var funParamList = RDP.tree.funParamList(token);
		token.expect(RDP.tree.rPar, 'RDP: fun missing rpar');
		var funBody = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: fun: Missing rpar');
		return new funStar(funName, funParamList, funBody, funStarTok.coords);
	};
	
	RDP.tree.special._greater = function(token) {
		var greaterTok = token.past();
		var greaterE1 = RDP.tree.exp(token);
		var greaterE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: >: Missing rpar');
		return new Greater(greaterE1, greaterE2, greaterTok.coords);
	};
	
	RDP.tree.special._if = function(token) {
		var ifTok = token.past();
		var ifCond = RDP.tree.exp(token);
		var ifThen = RDP.tree.exp(token);
		var ifElse = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: if: Missing rpar');
		return new If(ifCond, ifThen, ifElse, ifTok.coords);
	};
	
	RDP.tree.special._lambdaStar = function(token) {
		var lambdaStarTok = token.past();
		token.expect(RDP.tree.lPar, 'RDP: lambda missing lpar');
		var funParamList = RDP.tree.funParamList(token);
		token.expect(RDP.tree.rPar, 'RDP: lambda missing rpar');
		var funBody = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: lambda: Missing rpar');
		return new funStar(false, funParamList, funBody, lambdaStarTok.coords);
	};
	
	RDP.tree.special._let = function(token) {
		var letTok = token.past();
		token.expect(RDP.tree.identifier, 'RDP: first let parameter must be an identifier');
		var letName = token.past().s;
		var letExp = RDP.tree.exp(token);
		var letBody = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: let: Missing rpar');
		return new Let(letName, letExp, letBody, true, letTok.coords);
	};
	
	RDP.tree.special._letStar = function(token) {
		var letStarTok = token.past();
		token.expect(RDP.tree.lPar, 'RDP: let* missing lpar');
		var letList = RDP.tree.letList(token);
		token.expect(RDP.tree.rPar, 'RDP: let* missing rpar');
		var letBody = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: let*: Missing rpar');
		return letStar(letList, letBody, letStarTok.coords);
	};
	
	RDP.tree.special._letrecStar = function(token) {
		var letrecStarTok = token.past();
		token.expect(RDP.tree.lPar, 'RDP: letrec missing lpar');
		var letrecList = RDP.tree.letrecList(token);
		token.expect(RDP.tree.rPar, 'RDP: letrec missing rpar');
		var letrecBody = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: letrec: Missing rpar');
		return letrecStar(letrecList, letrecBody, letrecStarTok.coords);
	};
	
	RDP.tree.special._list = function(token) {
		var listTok = token.past();
		var pairList = RDP.tree.pairList(token);
		token.expect(RDP.tree.rPar, 'RDP: list: Missing rpar');
		return pairStar(pairList, listTok.coords);
	};
	
	RDP.tree.special._mod = function(token) {
		var modTok = token.past();
		var modE1 = RDP.tree.exp(token);
		var modE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: %: Missing rpar');
		return new Mod(modE1, modE2, modTok.coords);
	};
	
	RDP.tree.special._mul = function(token) {
		var mulTok = token.past();
		var mulE1 = RDP.tree.exp(token);
		var mulE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: *: Missing rpar');
		return new Mul(mulE1, mulE2, mulTok.coords);
	};
	
	RDP.tree.special._mut = function(token) {
		var mutTok = token.past();
		token.expect(RDP.tree.identifier, 'RDP: first mut parameter must be an identifier');
		var mutName = token.past().s;
		var mutExp = RDP.tree.exp(token);
		var mutBody = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: mut: Missing rpar');
		return new Let(mutName, mutExp, mutBody, false, mutTok.coords);
	};
	
	RDP.tree.special._not = function(token) {
		var notTok = token.past();
		var notE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: not: Missing rpar');
		return new Not(notE, notTok.coords);
	};
	
	RDP.tree.special._numQ = function(token) {
		var numQTok = token.past();
		var numQE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: num?: Missing rpar');
		return new NumQ(numQE, numQTok.coords);
	};
	
	RDP.tree.special._or = function(token) {
		var orTok = token.past();
		var orE1 = RDP.tree.exp(token);
		var orE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: or: Missing rpar');
		return new Or(orE1, orE2, orTok.coords);
	};
	
	RDP.tree.special._pair = function(token) {
		var pairTok = token.past();
		var pairE1 = RDP.tree.exp(token);
		var pairE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: pair: Missing rpar');
		return new Pair(pairE1, pairE2, pairTok.coords);
	};
	
	RDP.tree.special._pairQ = function(token) {
		var pairQTok = token.past();
		var pairE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: pair?: Missing rpar');
		return new PairQ(pairE, pairQTok.coords);
	};
	
	RDP.tree.special._print = function(token) {
		var printTok = token.past();
		var printPrintExp = RDP.tree.exp(token);
		var printRetExp = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: print: Missing rpar');
		return new Print(printPrintExp, printRetExp, printTok.coords);
	};
	
	RDP.tree.special._record = function(token) {
		var recordTok = token.past();
		var recordList = RDP.tree.recordList(token);
		token.expect(RDP.tree.rPar, 'RDP: record: Missing rpar');
		return new Record(recordList, recordTok.coords);
	};
	
	RDP.tree.special._recordQ = function(token) {
		var recordQTok = token.past();
		var recordQE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: record?: Missing rpar');
		return new RecordQ(recordQE, recordQTok.coords);
	};
	
	RDP.tree.special._set = function(token) {
		var setTok = token.past();
		token.expect(RDP.tree.identifier, 'RDP: first set parameter must be an identifier');
		var setName = token.past().s;
		var setValExp = RDP.tree.exp(token);
		var setRetExp = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: set: Missing rpar');
		return new Set(setName, setValExp, setRetExp, false, setTok.coords);
	};
	
	RDP.tree.special._setfst = function(token) {
		var setfstTok = token.past();
		token.expect(RDP.tree.identifier, 'RDP: first setfst parameter must be an identifier');
		var setfstName = token.past().s;
		var setfstValExp = RDP.tree.exp(token);
		var setfstRetExp = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: setfst: Missing rpar');
		return new SetFst(setfstName, setfstValExp, setfstRetExp, setfstTok.coords);
	};
	
	RDP.tree.special._setsnd = function(token) {
		var setsndTok = token.past();
		token.expect(RDP.tree.identifier, 'RDP: first setsnd parameter must be an identifier');
		var setsndName = token.past().s;
		var setsndValExp = RDP.tree.exp(token);
		var setsndRetExp = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: setsnd: Missing rpar');
		return new SetSnd(setsndName, setsndValExp, setsndRetExp, setsndTok.coords);
	};
	
	RDP.tree.special._snd = function(token) {
		var sndTok = token.past();
		var sndE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: snd: Missing rpar');
		return new Snd(sndE, sndTok.coords);
	};
	
	RDP.tree.special._strQ = function(token) {
		var strQTok = token.past();
		var strQE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: str?: Missing rpar');
		return new StrQ(strQE, strQTok.coords);
	};
	
	RDP.tree.special._sub = function(token) {
		var subTok = token.past();
		var subE1 = RDP.tree.exp(token);
		var subE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: -: Missing rpar');
		return new Sub(subE1, subE2, subTok.coords);
	};
	
	RDP.tree.special._unitQ = function(token) {
		var unitQTok = token.past();
		var unitQE = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: unit?: Missing rpar');
		return new UnitQ(unitQE, unitQTok.coords);
	};
	
	RDP.tree.special._xor = function(token) {
		var xorTok = token.past();
		var xorE1 = RDP.tree.exp(token);
		var xorE2 = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: xor: Missing rpar');
		return new Xor(xorE1, xorE2, xorTok.coords);
	};
	
	RDP.tree.special.bindings = [
		new StrHandlerPair('+'        , RDP.tree.special._add       ),
		new StrHandlerPair('and'      , RDP.tree.special._and       ),
		new StrHandlerPair('arrjs'    , RDP.tree.special._arrJS     ),
		new StrHandlerPair('bool?'    , RDP.tree.special._boolQ     ),
		new StrHandlerPair('call'     , RDP.tree.special._callStar  ),
		new StrHandlerPair('calljs'   , RDP.tree.special._callJS    ),
		new StrHandlerPair('closure?' , RDP.tree.special._closureQ  ),
		new StrHandlerPair('cond'     , RDP.tree.special._cond      ),
		new StrHandlerPair('contains?', RDP.tree.special._containsQ ),
		new StrHandlerPair('deref'    , RDP.tree.special._deref     ),
		new StrHandlerPair('/'        , RDP.tree.special._div       ),
		new StrHandlerPair('err'      , RDP.tree.special._err       ),
		new StrHandlerPair('fst'      , RDP.tree.special._fst       ),
		new StrHandlerPair('fun'      , RDP.tree.special._funStar   ),
		new StrHandlerPair('>'        , RDP.tree.special._greater   ),
		new StrHandlerPair('if'       , RDP.tree.special._if        ),
		new StrHandlerPair('lambda'   , RDP.tree.special._lambdaStar),
		new StrHandlerPair('let'      , RDP.tree.special._let       ),
		new StrHandlerPair('let*'     , RDP.tree.special._letStar   ),
		new StrHandlerPair('letrec'   , RDP.tree.special._letrecStar),
		new StrHandlerPair('list'     , RDP.tree.special._list      ),
		new StrHandlerPair('%'        , RDP.tree.special._mod       ),
		new StrHandlerPair('*'        , RDP.tree.special._mul       ),
		new StrHandlerPair('mut'      , RDP.tree.special._mut       ),
		new StrHandlerPair('not'      , RDP.tree.special._not       ),
		new StrHandlerPair('num?'     , RDP.tree.special._numQ      ), 
		new StrHandlerPair('or'       , RDP.tree.special._or        ),
		new StrHandlerPair('pair'     , RDP.tree.special._pair      ),
		new StrHandlerPair('pair?'    , RDP.tree.special._pairQ     ),
		new StrHandlerPair('print'    , RDP.tree.special._print     ),
		new StrHandlerPair('record'   , RDP.tree.special._record    ),
		new StrHandlerPair('record?'  , RDP.tree.special._recordQ   ), 
		new StrHandlerPair('set!'     , RDP.tree.special._set       ),
		new StrHandlerPair('setfst!'  , RDP.tree.special._setfst    ),
		new StrHandlerPair('setsnd!'  , RDP.tree.special._setsnd    ),
		new StrHandlerPair('snd'      , RDP.tree.special._snd       ),
		new StrHandlerPair('string?'  , RDP.tree.special._strQ      ),
		new StrHandlerPair('-'        , RDP.tree.special._sub       ),
		new StrHandlerPair('unit?'    , RDP.tree.special._unitQ     ),
		new StrHandlerPair('xor'      , RDP.tree.special._xor       )];
	//=============================================================================
	function StrHandlerPair(s, h) {
		this.s = s;
		this.h = h;
	}
	//-----------------------------------------------------------------------------
	function callStar(funexp, list, tokenCoords) {
		if(list.length > 0) {
			var old = new Call(funexp, list[0], tokenCoords);
			for(var i = 1; i < list.length; i++)
				old = new Call(old, list[i], tokenCoords);
		
			return old;
		}
		else return new Call(funexp, false, tokenCoords);
	}
	//-----------------------------------------------------------------------------
	function cond(list, def, tokenCoords) {
		var old = def;
		for(var i = list.length - 1; i >= 0; i--)
			old = new If(list[i].cond, list[i].exp, old, tokenCoords);
		
		return old;
	}
	
	function CondPair(cond, exp) {
		this.cond = cond;
		this.exp = exp;
	}
	//-----------------------------------------------------------------------------
	function funStar(name, list, body, tokenCoords) {
		var old = body;
		
		if(list.length == 0) {
			return new Fun(name, false, old, tokenCoords);
		}
		else {
			for(var i = list.length - 1; i > 0; i--)
				old = new Fun(false, list[i], old, tokenCoords);
			
			return new Fun(name, list[0], old, tokenCoords);
		}
	}
	//-----------------------------------------------------------------------------
	function letrecStar(list, body, tokenCoords) {
		var old = body;
		
		for(var i = list.length - 1; i >= 0; i--)
			old = new Set(list[i].name, list[i].exp, old, true, tokenCoords);
		
		for(var i = list.length - 1; i >= 0; i--)
			old = new Let(list[i].name, new Any(), old, true, tokenCoords);
		
		return old;
	}
	
	function LetrecStarPair(name, exp) {
		this.name = name;
		this.exp = exp;
	}
	//-----------------------------------------------------------------------------
	function letStar(list, body, tokenCoords) {
		var old = body;
		for(var i = list.length - 1; i >= 0; i--)
			old = new Let(list[i].name, list[i].exp, old, true, tokenCoords);
		
		return old;
	}
	
	function LetStarPair(name, exp) {
		this.name = name;
		this.exp = exp;
	}
	//-----------------------------------------------------------------------------
	function pairStar(list, tokenCoords) {
		var old = new Unit();
		for(var i = list.length - 1; i >= 0; i--)
			old = new Pair(list[i], old, tokenCoords);
		
		return old;
	}
	//-----------------------------------------------------------------------------
	return RDP;
})();