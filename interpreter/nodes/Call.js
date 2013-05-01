"use strict";

function Call(funexp, pexp) {
	this.funexp = funexp;
	this.pexp = pexp;
}

Call.prototype.ev = function(env, modSet) {
	var evClos = this.funexp.ev(env, modSet);
	
	//extenral call
	if(evClos instanceof Def) {
		var newEnv = modSet.getEnv(evClos.modName);
		if(!(evClos.fun.pformal === false || this.pexp === false)) {
			var evPexp = this.pexp.ev(env, modSet);
			newEnv = newEnv.con(new Binding(evClos.fun.pformal, evPexp));
		}
		
		return evClos.fun.body.ev(newEnv, modSet);
	}

	//local call
	if(!(evClos instanceof Closure)) throw 'Cannot call a non-function';
	
	var envPlusPar;
	if(evClos.fun.pformal === false || this.pexp === false)
		envPlusPar = evClos.env;
	else {
		var evPexp = this.pexp.ev(env, modSet); //evaluate the parameter
		envPlusPar = evClos.env.con(new Binding(evClos.fun.pformal, evPexp));
	}
	
	if(evClos.fun.name == false)
		return evClos.fun.body.ev(envPlusPar, modSet);
	else
		return evClos.fun.body.ev(envPlusPar.con(new Binding(evClos.fun.name, evClos)), modSet);
}

Call.prototype.accept = function(visitor, state) {
	return visitor.visitCall(this, state);
}

Call.prototype.toString = function() {
	return '(call ' + this.funexp + '\n' + this.pexp + ')';
}