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
	
	var _l = function(s) { return Tokenizer.chop(s); };
	
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
		throws(function() { _l('/*ml comment'); }, 'Multiline comment not properly terminated', 'ML comment badly terminated');
		throws(function() { _l('/*ml comm*ent*'); }, 'Multiline comment not properly terminated', 'ML comment badly terminated');
		throws(function() { _l("'str\ning'"); }, 'NL in single quoted string');
		throws(function() { _l('"str\ning"'); }, 'NL in double quoted string');
		throws(function() { _l("'"); }, 'Single quote');
		throws(function() { _l('"'); }, 'Double quote');
		throws(function() { _l('234iden'); }, 'Num.Identifier');
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
})();
