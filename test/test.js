"use strict";

var _l = function(s) { return Tokenizer.chop(s); }
var _p = function(s) { return RDP.single(Tokenizer.chop(s)); }
var _e = function(s, modSet) { 
	if(arguments.length > 1) return RDP.single(Tokenizer.chop(s)).ev(Env.Emp, modSet);
	else return RDP.single(Tokenizer.chop(s)).ev(Env.Emp); 
}
var _ej = function(s) { return eval(s); }
var _t = function(s) { return RDP.single(Tokenizer.chop(s)).accept(new StaticCheck(), new VarCheckState(Env.Emp, null)); }
var _m = function(s) { return RDP.tree(Tokenizer.chop(s)); }

var _tr = function(s) { 
	var exp = RDP.single(Tokenizer.chop(s)).ev(Env.Emp); 
	return ToJS.header() + '\n\n' + exp.accept(new ToJS()); 
}
var _eqnj = function(s) { return _e(s).getValue() == _ej(_tr(s)); }

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

module('tokenizer');
test('Atomic tests', function() {
	deepEqual(_l(''), [new TokEnd(new TokenCoords(0, 1))], 'Void parse');
	deepEqual(_l('        '), [new TokEnd(new TokenCoords(0, 9))], 'WS parse');
	deepEqual(_l('\n\n\n\n'), [new TokEnd(new TokenCoords(4, 1))], 'NL parse');
	deepEqual(_l('\t\t\t\t'), [new TokEnd(new TokenCoords(0, 5))], 'Tab parse');
	deepEqual(_l('//sl comment'), [new TokEnd(new TokenCoords(0, 14))], 'SL comment parse');
	deepEqual(_l('/*ml comment*/'), [new TokEnd(new TokenCoords(0, 15))], 'ML comment parse');
	deepEqual(_l('/*ml\ncomment*/'), [new TokEnd(new TokenCoords(1, 10))], 'ML comment with NL parse');
	deepEqual(_l('/'), [new TokKeyword('/', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 2))], 'Slash');
  deepEqual(_l('764'), [new TokNum(764, new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 4))], 'Num int parse');
  deepEqual(_l('764.432'), [new TokNum(764.432, new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 8))], 'Num float parse');
  deepEqual(_l('#t'), [new TokBool('#t', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 3))], 'Bool true parse');
  deepEqual(_l('#f'), [new TokBool('#f', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 3))], 'Bool false parse');
  deepEqual(_l("'string'"), [new TokStr('string', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 9))], 'Single quoted string parse');
  deepEqual(_l('"string"'), [new TokStr('string', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 9))], 'Double quoted string parse');
  deepEqual(_l("'str\\\'ing'"), [new TokStr('str\'ing', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 11))], 'Single quoted string with \\\' parse');
  deepEqual(_l('"str\\\"ing"'), [new TokStr('str\"ing', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 11))], 'Double quoted string with \\\" parse');
  deepEqual(_l('('), [new TokLPar(new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 2))], 'LPar parse');
  deepEqual(_l(')'), [new TokRPar(new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 2))], 'RPar parse');
});

test('Exceptions', function() {
	throws(function() { _l('/*ml comment') }, 'Multiline comment not properly terminated', 'ML comment badly terminated');
	throws(function() { _l('/*ml comm*ent*') }, 'Multiline comment not properly terminated', 'ML comment badly terminated');
	throws(function() { _l("'str\ning'") }, 'NL in single quoted string');
	throws(function() { _l('"str\ning"') }, 'NL in double quoted string');
	throws(function() { _l("'") }, 'Single quote');
	throws(function() { _l('"') }, 'Double quote');
	throws(function() { _l('234iden') }, 'Num.Identifier');
});

test('Identifiers', function() {
	deepEqual(_l('iden'), [new TokIdentifier('iden', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 5))], 'Identifier');
	deepEqual(_l('iden10'), [new TokIdentifier('iden10', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 7))], 'Identifier');
	deepEqual(_l('iden10th'), [new TokIdentifier('iden10th', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 9))], 'Identifier');
	deepEqual(_l('iden-a'), [new TokIdentifier('iden-a', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 7))], 'Identifier');
	deepEqual(_l('iden?'), [new TokIdentifier('iden?', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 6))], 'Identifier');
	deepEqual(_l('iden'), [new TokIdentifier('iden', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 5))], 'Identifier');
	deepEqual(_l('++'), [new TokIdentifier('++', new TokenCoords(0, 0)), new TokEnd(new TokenCoords(0, 3))], 'Identifier');
});
//=============================================================================
module('parser');
test('Atomic expressions', function() {
	deepEqual(RDP.single([new TokNum(234), new TokEnd()]), new Num(234), 'Number');
	deepEqual(RDP.single([new TokBool('#t'), new TokEnd()]), new Bool(true), 'Bool true');
	deepEqual(RDP.single([new TokBool('#f'), new TokEnd()]), new Bool(false), 'Bool false');
	deepEqual(RDP.single([new TokKeyword('unit'), new TokEnd()]), new Unit(), 'Unit');
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
//=============================================================================
module('interpreter');
test('Atomic trees', function() {
	deepEqual(new Num(234).ev(Env.Emp), new Num(234), 'Num');
	deepEqual(new Bool(true).ev(Env.Emp), new Bool(true), 'Bool');
	deepEqual(new Unit().ev(Env.Emp), new Unit(), 'Unit');
});

test('Math ops', function() {
	deepEqual(_e('(+ 15 20)'), new Num(15+20), 'Add');
	deepEqual(_e('(- 15 20)'), new Num(15-20), 'Sub');
	deepEqual(_e('(* 15 20)'), new Num(15*20), 'Mul');
	deepEqual(_e('(/ 15 20)'), new Num(15/20), 'Div');
	deepEqual(_e('(% 15 20)'), new Num(15%20), 'Mod');
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
	deepEqual(_e('(let a 10 a)'), new Num(10), 'Let');
	deepEqual(_e('(let a 10 (let a 20 a))'), new Num(20), 'Let');
});

test('Record', function() {
	deepEqual(_e('(deref (record (x 10) (y 20) (z 30)) x)'), new Num(10), 'Deref');
	deepEqual(_e('(deref (record (x 10) (y 20) (z 30)) y)'), new Num(20), 'Deref');
	deepEqual(_e('(deref (record (x 10) (y 20) (z 30)) z)'), new Num(30), 'Deref');
});

test('Fun', function() {
	deepEqual(_e('(call (fun f (x) (+ 10 x)) 5)'), new Num(15), 'Fun');
	deepEqual(_e('(let a 10 (call (fun f (x) (+ a x)) 5))'), new Num(15), 'Closure');
	deepEqual(_e('(let a 10 (let f (fun f (x) (+ a x)) (let a 30 (call f 5))))'), new Num(15), 'Closure scope');
});

test('Set!', function() {
	deepEqual(_e('(mut a 15 (set! a 33 a))'), new Num(33), 'Set!');
	deepEqual(_e('(let a (pair 11 22) (setfst! a 33 (fst a)))'), new Num(33), 'SetFst!');
	deepEqual(_e('(let a (pair 11 22) (setfst! a 33 (snd a)))'), new Num(22), 'SetFst!');
	deepEqual(_e('(let a (pair 11 22) (setsnd! a 33 (snd a)))'), new Num(33), 'SetSnd!');
	deepEqual(_e('(let a (pair 11 22) (setsnd! a 33 (fst a)))'), new Num(11), 'SetSnd!');
});

test('Extendibles', function() {
	deepEqual(_e('(cond ((#t 10) (#t 20)) 30)'), new Num(10), 'If*');
	deepEqual(_e('(cond ((#f 10) (#t 20)) 30)'), new Num(20), 'If*');
	deepEqual(_e('(cond ((#f 10) (#f 20)) 30)'), new Num(30), 'If*');
	
	deepEqual(_e('(let* ((a 10) (b 20)) a)'), new Num(10), 'Let*');
	deepEqual(_e('(let* ((a 10) (a 20)) a)'), new Num(20), 'Let*');
	deepEqual(_e('(let* ((a 10) (b a)) b)'), new Num(10), 'Let*');
	
	deepEqual(_e('(list 11 22 33 44 55)'), 
		new Pair(new Num(11), new Pair(new Num(22), new Pair(new Num(33), new Pair(new Num(44), new Pair(new Num(55), new Unit()))))), 'List');
	deepEqual(_e('(list 11)'), new Pair(new Num(11), new Unit()), 'Short list');
	deepEqual(_e('(list)'), new Unit(), 'Shortest list');
	
	deepEqual(_e('(call (fun f (a b) (+ a b)) 11 22)'), new Num(33), 'Call(Fun)');
	deepEqual(_e('(let c (call (fun f (a b) (+ a b)) 11) (call c 22))'), new Num(33), 'Call(Fun)');
	
	deepEqual(_e('(call (lambda (a b) (+ a b)) 11 22)'), new Num(33), 'Call(Lambda)');
	
	deepEqual(_e('(letrec ((a c) (b 22) (c b)) c)'), new Num(22), 'Letrec');
});
//=============================================================================
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
//=============================================================================
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
//=============================================================================
module('modules');
test('Simple calls', function() {
	var modSet = _m('(module m (public f (lambda (x) (* x x))) (public g (lambda (x) (+ x 10))))');
	deepEqual(_e('(call m.f 5)', modSet), new Num(25), 'call');
	deepEqual(_e('(call m.g 15)', modSet), new Num(25), 'call');
	
	modSet = _m('(module m (public f (lambda (x) (* x (call g x)))) (public g (lambda (x) (+ x 10))))');
	deepEqual(_e('(call m.f 5)', modSet), new Num(75), 'call');
	
	modSet = _m('(module m (public f (lambda (x) (* x (call g x)))) (private g (lambda (x) (+ x 10))))');
	deepEqual(_e('(call m.f 5)', modSet), new Num(75), 'call');
	throws(function() { _e('(call m.g 5)', modSet) }, 'call');
});

test('Environment reset', function() {
	var modSet = _m('(module m (public f (lambda (x) (* x a))))');
	throws(function() { _e('(let a 10 (call m.f 5))', modSet) }, 'let call');
	
	modSet = _m('(module m (public f (lambda (x) (let a 10 (call g x)))) (private g (lambda (x) (+ x a))))');
	throws(function() { _e('(call m.f 5)', modSet) }, 'call let call');
});
//=============================================================================
module('err');
test('Simple tests', function() {
	throws(function() { return _e('(err "oh noes!")'); }, 'oh noes!', 'simple throw');
	throws(function() { return _e('(if #f 10 (err 15))'); }, '15', 'if err');
	throws(function() { return _e('(err (if #f "no err" "err"))'); }, 'err', 'err if');
});
//=============================================================================
module('strings');
test('Simple tests', function() {
	deepEqual(_e('"a string"'), new Str('a string'), 'a string');
	deepEqual(_e('(string? "str")'), new Bool(true), 'string? string');
	deepEqual(_e('(string? unit)'), new Bool(false), 'string? unit');
	deepEqual(_e('(string? 321)'), new Bool(false), 'string? num');
});
//=============================================================================
module('toJS');
test('Primitives', function() {
	ok(_eqnj('25'), 'num');
	ok(_eqnj('#f'), 'bool');
	ok(_eqnj('"asd"'), 'str');
});

test('Simple functions', function() {
	ok(_eqnj('(+ 23 54)'), '+ num num');
	ok(_eqnj('(- 23 54)'), '- num num');
	ok(_eqnj('(* 23 54)'), '* num num');
	ok(_eqnj('(/ 23 54)'), '/ num num');
	ok(_eqnj('(% 23 54)'), '% num num');
	
	ok(_eqnj('(not #t)'), 'not bool');
	ok(_eqnj('(or #t #f)'), 'or bool bool');
	ok(_eqnj('(and #t #f)'), 'and bool bool');
	ok(_eqnj('(xor #t #f)'), 'xor bool bool');
	
	ok(_eqnj('(if #t 30 20)'), 'if #t');
	ok(_eqnj('(if #f 30 20)'), 'if #f');
});

test('Let, Let*, Letrec, Fun, Call', function() {
	ok(_eqnj('(let a 10 (+ a 3))'), 'let');
	ok(_eqnj('(let* ((a 10) (b (+ a 3))) (+ b 3))'), 'let*');
	ok(_eqnj('(letrec ((a c) (b 22) (c b)) c)'), 'letrec');
	ok(_eqnj('(letrec ((f1 (lambda (x) (+ (call f2 (- x 1)) 2))) (f2 (lambda (x) (if (> x 0) (* (call f1 (- x 1)) 2) 5)))) (call f1 7))'), 'letrec');
	ok(_eqnj('(let a 10 (call (lambda (x) (+ a x)) 4))'), 'closure');
	ok(_eqnj('(let f (lambda (x y) (+ x y)) (call f 10 20))'), 'fun par1 par2');
});