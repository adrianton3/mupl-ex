var Tokenizer = require('./tokenizer/Tokenizer.js').Tokenizer;
var RDP = require('./parser/RDP.js').RDP;
var StaticCheck = require('./interpreter/StaticCheck.js').StaticCheck;
var VarCheckState = require('./interpreter/VarCheckState.js').VarCheckState;
var Env = require('./interpreter/Env.js').Env;
var Out = require('./interpreter/Out.js').Out;

var expIn = process.argv[2];

try {
	var toksFreeExp = Tokenizer.chop(expIn);
	var _parsedFreeExp = RDP.single(toksFreeExp);
	var freeExpt = _parsedFreeExp.accept(new StaticCheck(), new VarCheckState(Env.Emp, null));
	
	// interpret
	var istr = '';
	Out.reset();
	var res = _parsedFreeExp.ev(Env.Emp);
	istr += res.toString();
	istr += '\n---\n\n';
	istr += Out.toString();
} catch(err) {
	istr += err;
}

console.log(istr);
