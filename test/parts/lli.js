(function() {
	"use strict";
	
	var Tokenizer = require('../tokenizer/Tokenizer.js').Tokenizer;
	var RDP = require('../parser/RDP.js').RDP;
	var Env = require('../interpreter/Env.js').Env;
	var ToLL = require('../lli/ToLL.js').ToLL;
	var LLI = require('../lli/LLI.js').LLI;
	
	var _e = function(s, modSet) { 
		if(arguments.length > 1) return RDP.single(Tokenizer.chop(s)).ev(Env.Emp, modSet);
		else return RDP.single(Tokenizer.chop(s)).ev(Env.Emp); 
	};
	
	var _ell = function(s) { 
		var lli = new LLI();
		var opStack = lli.interpret(s);
		if(opStack.length !== 1) throw 'Too many/few elements left on stack'; 
		return opStack[0]; 
	};
	
	var _trll = function(s) { 
		var exp = RDP.single(Tokenizer.chop(s)); 
		return exp.accept(new ToLL()); 
	};
	
	var _eqnll = function(s) { return _e(s).getValue() == _ell(_trll(s)); };
	
	module('toLL');
	test('Primitives', function() {
		ok(_eqnll('25'), 'num');
	});
	
	test('Simple functions', function() {
		ok(_eqnll('(+ 23 54)'), '+ num num');
		ok(_eqnll('(* 23 54)'), '+ num num');
		ok(_eqnll('(> 23 54)'), '+ num num');
		ok(_eqnll('(> 54 23)'), '+ num num');
		
		ok(_eqnll('(if (> 1 2) 30 20)'), 'if #t');
		ok(_eqnll('(if (> 2 1) 30 20)'), 'if #f');
	});
	
	test('Fun, Call', function() {
		ok(_eqnll('(call (lambda (x) (+ x 30)) 20)'), 'call lambda');
		ok(_eqnll('(call (lambda (x y) (+ x y)) 10 45)'), 'call lambda');
	});
})();
