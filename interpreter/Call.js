"use strict";

function Call(funexp, pexp) {
	this.funexp = funexp;
	this.pexp = pexp;
}

Call.prototype.ev = function(env) {
	var evClos = this.funexp.ev(env); //evaluates to a closure
	if(!(evClos instanceof Closure)) throw 'cannot call a non-function';
	
	var envPlusPar;
	if(evClos.fun.pformal === false || this.pexp === false)
		envPlusPar = evClos.env;
	else {
		var evPexp = this.pexp.ev(env); //evaluate the parameter
		envPlusPar = evClos.env.con(new Binding(evClos.fun.pformal, evPexp));
	}
	
	if(evClos.fun.name == false)
		return evClos.fun.body.ev(envPlusPar);
	else
		return evClos.fun.body.ev(envPlusPar.con(new Binding(evClos.fun.name, evClos)));
}

Call.prototype.toString = function() {
	return '(call ' + this.funexp + '\n' + this.pexp + ')';
}