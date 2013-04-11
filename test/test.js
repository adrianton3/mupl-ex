"use strict";

var _l = function(s) { return Tokenizer.chop(s); }
var _p = function(s) { return RDP.tree(Tokenizer.chop(s)); }
var _e = function(s) { return RDP.tree(Tokenizer.chop(s)).ev(Emp); }

module('tokenizer');
test('Atomic tests', function() {
	deepEqual(_l(''), [new TokEnd()], 'Void parse');
	deepEqual(_l('        '), [new TokEnd()], 'WS parse');
	deepEqual(_l('\n\n\n\n'), [new TokEnd()], 'NL parse');
	deepEqual(_l('\t\t\t\t'), [new TokEnd()], 'Tab parse');
	deepEqual(_l('//sl comment'), [new TokEnd()], 'SL comment parse');
	deepEqual(_l('/*ml comment*/'), [new TokEnd()], 'ML comment parse');
	deepEqual(_l('/*ml\ncomment*/'), [new TokEnd()], 'ML comment with NL parse');
  deepEqual(_l('764'), [new TokNum(764), new TokEnd()], 'Num int parse');
  deepEqual(_l('764.432'), [new TokNum(764.432), new TokEnd()], 'Num float parse');
  deepEqual(_l('#t'), [new TokBool('#t'), new TokEnd()], 'Bool true parse');
  deepEqual(_l('#f'), [new TokBool('#f'), new TokEnd()], 'Bool false parse');
  deepEqual(_l("'string'"), [new TokStr('string'), new TokEnd()], 'Single quoted string parse');
  deepEqual(_l('"string"'), [new TokStr('string'), new TokEnd()], 'Double quoted string parse');
  deepEqual(_l("'str\\\'ing'"), [new TokStr('str\'ing'), new TokEnd()], 'Single quoted string with \\\' parse');
  deepEqual(_l('"str\\\"ing"'), [new TokStr('str\"ing'), new TokEnd()], 'Double quoted string with \\\" parse');
  deepEqual(_l('('), [new TokLPar(), new TokEnd()], 'LPar parse');
  deepEqual(_l(')'), [new TokRPar(), new TokEnd()], 'RPar parse');
});

test('Exceptions', function() {
	throws(function() { _l('/*ml comment') }, 'Multiline comment not properly terminated', 'ML comment badly terminated');
	throws(function() { _l('/*ml comm*ent*') }, 'Multiline comment not properly terminated', 'ML comment badly terminated');
	throws(function() { _l("'str\ning'") }, 'NL in single quoted string');
	throws(function() { _l('"str\ning"') }, 'NL in double quoted string');
	throws(function() { _l("'") }, 'Single quote');
	throws(function() { _l('"') }, 'Double quote');
});
//=============================================================================
module('parser');
test('Atomic expressions', function() {
	deepEqual(RDP.tree([new TokNum(234), new TokEnd()]), new Num(234), 'Number');
	deepEqual(RDP.tree([new TokBool('#t'), new TokEnd()]), new Bool(true), 'Bool true');
	deepEqual(RDP.tree([new TokBool('#f'), new TokEnd()]), new Bool(false), 'Bool false');
	deepEqual(RDP.tree([new TokKeyword('unit'), new TokEnd()]), new Unit(), 'Unit');
});

test('Simple expressions', function() {
	deepEqual(_p('234'), new Num(234), 'Num');
	deepEqual(_p('asd'), new Var('asd'), 'Var');
	
	deepEqual(_p('(if #t 11 22)'), new If(new Bool(true), new Num(11), new Num(22)), 'If');
	
	deepEqual(_p('(unit? unit)'), new UnitQ(new Unit()));
	deepEqual(_p('(bool? 234)'), new BoolQ(new Num(234)));
	deepEqual(_p('(num? #f)'), new NumQ(new Bool(false)));
	
	deepEqual(_p('(pair 11 22)'), new Pair(new Num(11), new Num(22)));
	deepEqual(_p('(pair? (pair 11 22))'), new PairQ(new Pair(new Num(11), new Num(22))));
	deepEqual(_p('(fst (pair 11 22))'), new Fst(new Pair(new Num(11), new Num(22))));
	deepEqual(_p('(snd (pair 11 22))'), new Snd(new Pair(new Num(11), new Num(22))));
});
//=============================================================================
module('interpreter');
test('Atomic trees', function() {
	deepEqual(new Num(234).ev(Emp), new Num(234), 'Num');
	deepEqual(new Bool(true).ev(Emp), new Bool(true), 'Bool');
	deepEqual(new Unit().ev(Emp), new Unit(), 'Unit');
});

test('Math ops', function() {
	deepEqual(_e('(+ 15 20)'), new Num(35), 'Add');
	deepEqual(_e('(- 15 20)'), new Num(-5), 'Sub');
	deepEqual(_e('(* 15 20)'), new Num(300), 'Mul');
});

test('Bool ops', function() {
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
});

test('Scope', function() {
	deepEqual(new Var('a').ev(Emp.con(new Binding('a', new Num(10)))), new Num(10), 'Simple lookup');
	deepEqual(new Var('a').ev(Emp.con(new Binding('a', new Num(10)))
															 .con(new Binding('a', new Num(20)))), new Num(20), 'Shadowing');
	deepEqual(_e('(let a 10 a)'), new Num(10), 'Let');
	deepEqual(_e('(let a 10 (let a 20 a))'), new Num(20), 'Let');
});

test('Record', function() {
	deepEqual(_e('(deref (record (x 10) (y 20) (z 30)) x)'), new Num(10), 'Deref');
	deepEqual(_e('(deref (record (x 10) (y 20) (z 30)) y)'), new Num(20), 'Deref');
	deepEqual(_e('(deref (record (x 10) (y 20) (z 30)) z)'), new Num(30), 'Deref');
});

test('Fun', function() {
	deepEqual(_e('(call (fun f x (+ 10 x)) 5)'), new Num(15), 'Fun');
	deepEqual(_e('(let a 10 (call (fun f x (+ a x)) 5))'), new Num(15), 'Closure');
	deepEqual(_e('(let a 10 (let f (fun f x (+ a x)) (let a 30 (call f 5))))'), new Num(15), 'Closure scope');
});

test('Set!', function() {
	deepEqual(_e('(let a 15 (set! a 33 a))'), new Num(33), 'Set!');
	deepEqual(_e('(let a (pair 11 22) (setfst! a 33 (fst a)))'), new Num(33), 'SetFst!');
	deepEqual(_e('(let a (pair 11 22) (setfst! a 33 (snd a)))'), new Num(22), 'SetFst!');
	deepEqual(_e('(let a (pair 11 22) (setsnd! a 33 (snd a)))'), new Num(33), 'SetSnd!');
	deepEqual(_e('(let a (pair 11 22) (setsnd! a 33 (fst a)))'), new Num(11), 'SetSnd!');
});

test('Extendibles', function() {
	deepEqual(_e('(if* ((#t 10) (#t 20)) 30)'), new Num(10), 'If*');
	deepEqual(_e('(if* ((#f 10) (#t 20)) 30)'), new Num(20), 'If*');
	deepEqual(_e('(if* ((#f 10) (#f 20)) 30)'), new Num(30), 'If*');
	
	deepEqual(_e('(let* ((a 10) (b 20)) a)'), new Num(10), 'Let*');
	deepEqual(_e('(let* ((a 10) (a 20)) a)'), new Num(20), 'Let*');
	deepEqual(_e('(let* ((a 10) (b a)) b)'), new Num(10), 'Let*');
	
	deepEqual(_e('(list 11 22 33 44 55)'), 
		new Pair(new Num(11), new Pair(new Num(22), new Pair(new Num(33), new Pair(new Num(44), new Pair(new Num(55), new Unit()))))), 'List');
	deepEqual(_e('(list 11)'), new Pair(new Num(11), new Unit()), 'Short list');
	deepEqual(_e('(list)'), new Unit(), 'Shortest list');
	
	deepEqual(_e('(call* (fun* f (a b) (+ a b)) 11 22)'), new Num(33), 'Call*(Fun*)');
	deepEqual(_e('(let c (call (fun* f (a b) (+ a b)) 11) (call c 22))'), new Num(33), 'Call*(Fun*)');
	
	deepEqual(_e('(letrec ((a c) (b 22) (c b)) c)'), new Num(22), 'Letrec');
});
