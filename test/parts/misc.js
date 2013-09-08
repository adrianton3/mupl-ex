(function() {
	"use strict";
	
	var Tokenizer = require('../tokenizer/Tokenizer.js').Tokenizer;
	var TokenCoords = require('../tokenizer/TokenCoords.js').TokenCoords;
	
	var Bool = require('../interpreter/nodes/Bool.js').Bool;
	var Num = require('../interpreter/nodes/Num.js').Num;
	var Str = require('../interpreter/nodes/Str.js').Str;
	
	var VarBinding = require('../interpreter/VarBinding.js').VarBinding;
	var Env = require('../interpreter/Env.js').Env;
	
	var StaticCheck = require('../interpreter/StaticCheck.js').StaticCheck;
	var VarCheckState = require('../interpreter/VarCheckState.js').VarCheckState;
	var ToJS = require('../interpreter/ToJS.js').ToJS;
	
	var RDP = require('../parser/RDP.js').RDP;
	
	var _e = function(s, modSet) {
		if(arguments.length > 1) return RDP.single(Tokenizer.chop(s)).ev(Env.Emp, modSet);
		else return RDP.single(Tokenizer.chop(s)).ev(Env.Emp); 
	};
	
	module('err');
	test('Simple tests', function() {
		throws(function() { return _e('(err "oh noes!")'); }, 'oh noes!', 'simple throw');
		throws(function() { return _e('(if #f 10 (err 15))'); }, '15', 'if err');
		throws(function() { return _e('(err (if #f "no err" "err"))'); }, 'err', 'err if');
	});
	
	module('strings');
	test('Simple tests', function() {
		deepEqual(_e('"a string"'), new Str('a string'), 'a string');
		deepEqual(_e('(string? "str")'), new Bool(true), 'string? string');
		deepEqual(_e('(string? unit)'), new Bool(false), 'string? unit');
		deepEqual(_e('(string? 321)'), new Bool(false), 'string? num');
	});
})();