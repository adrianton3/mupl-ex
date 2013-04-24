"use strict";

/*
 * exp -> 
 *   ( special )
 * | id
 * | bool
 * | num
 * | str
 * 
 * special ->
 *   if exp exp exp
 * | if* ( if_list ) exp
 * | fun name name exp
 * | fun* name ( name_list ) exp
 * | call exp exp
 * | call* exp ( param_list )
 * | let name exp exp
 * | let* ( let_list ) exp
 * | letrec ( letrec_list ) exp
 * | pair exp exp
 * | pair? exp
 * | list list_list
 * | record record_pairs
 * | record? exp
 * | contains? exp contains_list
 * | deref exp name
 * | num? exp
 * | and exp exp
 * | or exp exp
 * | xor exp exp
 * | + exp exp
 * | - exp exp
 * | * exp exp
 * | > exp exp
 * 
 * if_list -> [ ( exp exp ) ]
 * name_list -> [ name ]
 * param_list -> [ exp ]
 * let_list -> [ ( name exp ) ]
 * letrec_list -> [ ( name exp ) ]
 * list_list -> [ exp ]
 * record_pairs -> [ ( name exp ) ]
 * contains_list -> name [ name ]
 */

function RDP() {

}

RDP.tree = function(tokenar) {
	var token = new TokenList(tokenar);
	var t = RDP.tree.exp(token);
	token.expect(new TokEnd(), 'RDP: expression not properly terminated');
	return t;
}

RDP.tree.num = new TokNum();
RDP.tree.identifier = new TokIdentifier();
RDP.tree.bool = new TokBool();

RDP.tree.lPar = new TokLPar();
RDP.tree.rPar = new TokRPar();

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
	else if(token.match('unit')) {
		token.adv();
		return new Unit();
	}
	else if(token.match(RDP.tree.identifier)) {
		return new Var(token.next().s);
	}
	else
		throw 'RDP: err ' + token.cur().toString();
}

RDP.tree.ifList = function(token) {
	var list = [];
	while(!token.match(RDP.tree.rPar)) {
		token.adv();
		var cond = RDP.tree.exp(token);
		var exp = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: iflist: Missing rpar');
		
		list.push(new IfStarPair(cond, exp));
	}
	return list;
}

RDP.tree.funParamList = function(token) {
	var list = [];
	while(!token.match(RDP.tree.rPar)) {
		token.expect(RDP.tree.identifier, 'RDP: fun: identifiers expected');
		list.push(token.past().s);
	}
	return list;
}

RDP.tree.callParamList = function(token) {
	var list = [];
	while(!token.match(RDP.tree.rPar)) {
		var exp = RDP.tree.exp(token);
		list.push(exp);
	}
	return list;
}

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
}

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
}

RDP.tree.pairList = function(token) {
	var list = [];
	while(!token.match(RDP.tree.rPar)) {
		var exp = RDP.tree.exp(token);
		list.push(exp);
	}
	return list;
}

RDP.tree.recordList = function(token) {
	var list = [];
	while(!token.match(RDP.tree.rPar)) {
		token.adv();
		token.expect(RDP.tree.identifier, 'RDP: first record pair member must be an identifier');
		var name = token.past().s;
		var exp = RDP.tree.exp(token);
		token.expect(RDP.tree.rPar, 'RDP: record: Missing rpar');
		
		list.push(new RecordPair(name, exp));
	}
	return list;
}

RDP.tree.containsList = function(token) {
	var list = [];
	
	token.expect(RDP.tree.identifier, 'RDP: contains?: identifiers expected');
	list.push(token.past().s);
	token.adv();
	
	while(!token.match(RDP.tree.rPar)) {
		token.expect(RDP.tree.identifier, 'RDP: contains?: identifiers expected');
		list.push(token.past().s);
		
		token.adv();
	}
	return list;
}

RDP.tree.special = function(token) {
	for(var i in RDP.tree.special.bindings) {
		if(token.match(RDP.tree.special.bindings[i].s)) {
			token.adv();
			return RDP.tree.special.bindings[i].h(token);
		}
	}

	throw 'RDP: unknown function: ' + token.cur();
}

RDP.tree.special._if = function(token) {
	var ifCond = RDP.tree.exp(token);
	var ifThen = RDP.tree.exp(token);
	var ifElse = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: if: Missing rpar');
	return new If(ifCond, ifThen, ifElse);
}

RDP.tree.special._ifStar = function(token) {
	token.expect(RDP.tree.lPar, 'RDP: if* missing lpar');
	var ifList = RDP.tree.ifList(token);
	token.expect(RDP.tree.rPar, 'RDP: if* missing rpar');
	var ifDef = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: if*: Missing rpar');
	return ifStar(ifList, ifDef);
}

RDP.tree.special._lambdaStar = function(token) {
	token.expect(RDP.tree.lPar, 'RDP: lambda missing lpar');
	var funParamList = RDP.tree.funParamList(token);
	token.expect(RDP.tree.rPar, 'RDP: lambda missing rpar');
	var funBody = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: lambda: Missing rpar');
	return new funStar(false, funParamList, funBody);
}

RDP.tree.special._funStar = function(token) {
	token.expect(RDP.tree.identifier, 'RDP: first fun parameter must be an identifier');
	var funName = token.past().s;
	token.expect(RDP.tree.lPar, 'RDP: fun missing lpar');
	var funParamList = RDP.tree.funParamList(token);
	token.expect(RDP.tree.rPar, 'RDP: fun missing rpar');
	var funBody = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: fun: Missing rpar');
	return new funStar(funName, funParamList, funBody);
}

RDP.tree.special._callStar = function(token) {
	var callCallee = RDP.tree.exp(token);
	var callParamList = RDP.tree.callParamList(token);
	token.expect(RDP.tree.rPar, 'RDP: call*: Missing rpar');
	return new callStar(callCallee, callParamList);
}

RDP.tree.special._let = function(token) {
	token.expect(RDP.tree.identifier, 'RDP: first let parameter must be an identifier');
	var letName = token.past().s;
	var letExp = RDP.tree.exp(token);
	var letBody = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: let: Missing rpar');
	return new Let(letName, letExp, letBody);
}

RDP.tree.special._letStar = function(token) {
	token.expect(RDP.tree.lPar, 'RDP: let* missing lpar');
	var letList = RDP.tree.letList(token);
	token.expect(RDP.tree.rPar, 'RDP: let* missing rpar');
	var letBody = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: let*: Missing rpar');
	return letStar(letList, letBody);
}

RDP.tree.special._letrecStar = function(token) {
	token.expect(RDP.tree.lPar, 'RDP: letrec missing lpar');
	var letrecList = RDP.tree.letrecList(token);
	token.expect(RDP.tree.rPar, 'RDP: letrec missing rpar');
	var letrecBody = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: letrec: Missing rpar');
	return letrecStar(letrecList, letrecBody);
}

RDP.tree.special._pair = function(token) {
	var pairE1 = RDP.tree.exp(token);
	var pairE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: pair: Missing rpar');
	return new Pair(pairE1, pairE2);
}

RDP.tree.special._pairQ = function(token) {
	var pairE = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: pair?: Missing rpar');
	return new PairQ(pairE);
}

RDP.tree.special._fst = function(token) {
	var fstE = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: fst: Missing rpar');
	return new Fst(fstE);
}

RDP.tree.special._snd = function(token) {
	var sndE = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: snd: Missing rpar');
	return new Snd(sndE);
}

RDP.tree.special._list = function(token) {
	var pairList = RDP.tree.pairList(token);
	token.expect(RDP.tree.rPar, 'RDP: list: Missing rpar');
	return pairStar(pairList);
}

RDP.tree.special._record = function(token) {
	var recordList = RDP.tree.recordList(token);
	token.expect(RDP.tree.rPar, 'RDP: record: Missing rpar');
	return new Record(recordList);
}

RDP.tree.special._recordQ = function(token) {
	var recordQE = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: record?: Missing rpar');
	return new RecordQ(recordQE);
}

RDP.tree.special._deref = function(token) {
	var derefExp = RDP.tree.exp(token);
	token.expect(RDP.tree.identifier, 'RDP: second deref parameter must be an identifier');
	var derefName = token.past().s;
	token.expect(RDP.tree.rPar, 'RDP: deref: Missing rpar');
	return new Deref(derefExp, derefName);
}

RDP.tree.special._containsQ = function(token) {
	var containsExp = RDP.tree.exp(token);
	var containsList = RDP.tree.containsList(token);
	token.expect(RDP.tree.rPar, 'RDP: contains?: Missing rpar');
	return new ContainsQ(containsList);
}

RDP.tree.special._unitQ = function(token) {
	var unitQE = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: unit?: Missing rpar');
	return new UnitQ(unitQE);
}

RDP.tree.special._boolQ = function(token) {
	var boolQE = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: bool?: Missing rpar');
	return new BoolQ(boolQE);
}

RDP.tree.special._numQ = function(token) {
	var numQE = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: num?: Missing rpar');
	return new NumQ(numQE);
}

RDP.tree.special._add = function(token) {
	var addE1 = RDP.tree.exp(token);
	var addE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: +: Missing rpar');
	return new Add(addE1, addE2);
}

RDP.tree.special._sub = function(token) {
	var subE1 = RDP.tree.exp(token);
	var subE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: -: Missing rpar');
	return new Sub(subE1, subE2);
}

RDP.tree.special._mul = function(token) {
	var mulE1 = RDP.tree.exp(token);
	var mulE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: *: Missing rpar');
	return new Mul(mulE1, mulE2);
}

RDP.tree.special._div = function(token) {
	var divE1 = RDP.tree.exp(token);
	var divE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: /: Missing rpar');
	return new Div(divE1, divE2);
}

RDP.tree.special._mod = function(token) {
	var modE1 = RDP.tree.exp(token);
	var modE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: %: Missing rpar');
	return new Mod(modE1, modE2);
}

RDP.tree.special._greater = function(token) {
	var greaterE1 = RDP.tree.exp(token);
	var greaterE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: >: Missing rpar');
	return new Greater(greaterE1, greaterE2);
}

RDP.tree.special._not = function(token) {
	var notE = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: not: Missing rpar');
	return new Not(notE);
}

RDP.tree.special._and = function(token) {
	var andE1 = RDP.tree.exp(token);
	var andE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: and: Missing rpar');
	return new And(andE1, andE2);
}

RDP.tree.special._or = function(token) {
	var orE1 = RDP.tree.exp(token);
	var orE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: or: Missing rpar');
	return new Or(orE1, orE2);
}

RDP.tree.special._xor = function(token) {
	var xorE1 = RDP.tree.exp(token);
	var xorE2 = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: xor: Missing rpar');
	return new Xor(xorE1, xorE2);
}

RDP.tree.special._set = function(token) {
	token.expect(RDP.tree.identifier, 'RDP: first set parameter must be an identifier');
	var setName = token.past().s;
	var setValExp = RDP.tree.exp(token);
	var setRetExp = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: set: Missing rpar');
	return new Set(setName, setValExp, setRetExp);
}

RDP.tree.special._setfst = function(token) {
	token.expect(RDP.tree.identifier, 'RDP: first setfst parameter must be an identifier');
	var setfstName = token.past().s;
	var setfstValExp = RDP.tree.exp(token);
	var setfstRetExp = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: setfst: Missing rpar');
	return new SetFst(setfstName, setfstValExp, setfstRetExp);
}

RDP.tree.special._setsnd = function(token) {
	token.expect(RDP.tree.identifier, 'RDP: first setsnd parameter must be an identifier');
	var setsndName = token.past().s;
	var setsndValExp = RDP.tree.exp(token);
	var setsndRetExp = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: setsnd: Missing rpar');
	return new SetSnd(setsndName, setsndValExp, setsndRetExp);
}

RDP.tree.special._print = function(token) {
	var printPrintExp = RDP.tree.exp(token);
	var printRetExp = RDP.tree.exp(token);
	token.expect(RDP.tree.rPar, 'RDP: print: Missing rpar');
	return new Print(printPrintExp, printRetExp);
}

RDP.tree.special.bindings = [
	new StrHandlerPair('if'       , RDP.tree.special._if        ),
	new StrHandlerPair('cond'     , RDP.tree.special._ifStar    ),
	new StrHandlerPair('let'      , RDP.tree.special._let       ),
	new StrHandlerPair('let*'     , RDP.tree.special._letStar   ),
	new StrHandlerPair('letrec'   , RDP.tree.special._letrecStar),
	new StrHandlerPair('lambda'   , RDP.tree.special._lambdaStar),
	new StrHandlerPair('fun'      , RDP.tree.special._funStar   ),
	new StrHandlerPair('call'     , RDP.tree.special._callStar  ),
	new StrHandlerPair('record'   , RDP.tree.special._record    ),
	new StrHandlerPair('record?'  , RDP.tree.special._recordQ   ),
	new StrHandlerPair('contains?', RDP.tree.special._containsQ ),
	new StrHandlerPair('deref'    , RDP.tree.special._deref     ),
	new StrHandlerPair('>'        , RDP.tree.special._greater   ),
	new StrHandlerPair('not'      , RDP.tree.special._not       ),
	new StrHandlerPair('and'      , RDP.tree.special._and       ),
	new StrHandlerPair('or'       , RDP.tree.special._or        ), 
	new StrHandlerPair('xor'      , RDP.tree.special._xor       ), 
	new StrHandlerPair('+'        , RDP.tree.special._add       ), 
	new StrHandlerPair('-'        , RDP.tree.special._sub       ), 
	new StrHandlerPair('*'        , RDP.tree.special._mul       ),
	new StrHandlerPair('/'        , RDP.tree.special._div       ),
	new StrHandlerPair('%'        , RDP.tree.special._mod       ), 
	new StrHandlerPair('num?'     , RDP.tree.special._numQ      ), 
	new StrHandlerPair('unit?'    , RDP.tree.special._unitQ     ),
	new StrHandlerPair('bool?'    , RDP.tree.special._boolQ     ),
	new StrHandlerPair('pair'     , RDP.tree.special._pair      ),
	new StrHandlerPair('pair?'    , RDP.tree.special._pairQ     ),
	new StrHandlerPair('list'     , RDP.tree.special._list      ),
	new StrHandlerPair('fst'      , RDP.tree.special._fst       ),
	new StrHandlerPair('snd'      , RDP.tree.special._snd       ), 
	new StrHandlerPair('set!'     , RDP.tree.special._set       ),
	new StrHandlerPair('setfst!'  , RDP.tree.special._setfst    ),
	new StrHandlerPair('setsnd!'  , RDP.tree.special._setsnd    ),
	new StrHandlerPair('print'  ,   RDP.tree.special._print     )];
//=============================================================================
function StrHandlerPair(s, h) {
	this.s = s;
	this.h = h;
}
