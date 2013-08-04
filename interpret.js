var Tokenizer = require('./tokenizer/Tokenizer.js').Tokenizer;
var RDP = require('./parser/RDP.js').RDP;
var StaticCheck = require('./interpreter/StaticCheck.js').StaticCheck;
var VarCheckState = require('./interpreter/VarCheckState.js').VarCheckState;
var Env = require('./interpreter/Env.js').Env;
var Out = require('./interpreter/Out.js').Out;

var stdout = process.stdout;
var expIn = process.argv[2];

var istr = '';
try {
	var toksFreeExp = Tokenizer.chop(expIn);
	var _parsedFreeExp = RDP.single(toksFreeExp);
	var freeExpt = _parsedFreeExp.accept(new StaticCheck(), new VarCheckState(Env.Emp, null));

	Out.reset();
	
	var res = _parsedFreeExp.ev(Env.Emp);
	istr += res.toString() + '\n';
	
	var outStr = Out.toString();
		if(outStr.length > 0) {
			istr += 'Out ======\n\n';
			istr += outStr;
		}
} catch(err) {
	istr += err;
}

stdout.write(istr + '\n');
