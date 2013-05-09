"use strict";

function Env(n, tail) {
	this.n = n;
	
	if(arguments.length < 2) this.tail = Env.Emp;
	else this.tail = tail;
}

Env.prototype.hd = function() { return this.n; };
Env.prototype.tl = function() { return this.tail; };
Env.prototype.con = function(n) { return new Env(n, this); };
Env.prototype.empty = function() { return false; };
Env.prototype.toString = function() { return this.n.toString() + this.tail.toString(); };

Env.prototype.getBinding = function(s) { 
		if(this.n.s == s) return this.n;
		else return this.tail.findBinding(s);
}

Env.prototype.findBinding = function(s) { 
		if(this.n.s == s) return this.n.v;
		else return this.tail.findBinding(s);
}

Env.prototype.setBinding = function(s, nv) { 
		if(this.n.s == s) this.n.v = nv;
		else return this.tail.setBinding(s, nv);
}

Env.Emp = {
	hd: function() { throw 'Emp has no head'; },
	tl: function() { throw 'Emp has no tail'; },
	con: function(n) { return new Env(n, this); },
	empty: function() { return true; },
	toString: function() { return '.'; },
	getBinding: function(s) { throw 'Find binding failed for ' + s; },
	findBinding: function(s) { throw 'Find binding failed for ' + s; },
	setBinding: function(s) { throw 'Set binding failed for ' + s; },
}
//=============================================================================
function Binding(s, v) {
	this.s = s;
	this.v = v;
}

Binding.prototype.toString = function() {
	return this.s + ' := ' + this.v;
}
