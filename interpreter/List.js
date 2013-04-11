"use strict";

var Emp = { };

Emp.hd = function() { throw 'Emp has no head'; };
Emp.tl = function() { throw 'Emp has no tail'; };
Emp.con = function(n) { return new List(n, this); };
Emp.empty = function() { return true; };
Emp.len = function() { return 0; };
Emp.toString = function() { return '.'; };

Emp.find = function() { throw 'Find failed'; }

Emp.findBinding = function() { throw 'Find binding failed'; }
Emp.setBinding = function() { throw 'Set binding failed'; }

Emp.reverse = function() { return Emp; }
Emp.append = function(that) { return new List(that, this); }
//=============================================================================
function List(n, tail) {
	this.n = n;
	
	if(tail == undefined) this.tail = Emp;
	else this.tail = tail;
	
	this.length = this.tail.len() + 1;
}

List.prototype.hd = function() { return this.n; };
List.prototype.tl = function() { return this.tail; };
List.prototype.con = function(n) { return new List(n, this); };
List.prototype.empty = function() { return false; };
List.prototype.len = function() { return this.length; };
List.prototype.toString = function() { return this.n.toString() + this.tail.toString(); };

List.prototype.find = function(c) { if(c(this.n)) return this; else return this.tail.find(c); }

List.prototype.reverse = function() {
	var loop = function(part, acc) {
		if(part.empty()) return acc;
		return loop(part.tl(), acc.con(part.hd()));
	};
	
	return loop(this, Emp);
} 

List.prototype.append = function(that) {
	var loop = function(part, acc) {
		if(part.empty()) return acc;
		return loop(part.tl(), acc.con(part.hd()));
	};
	
	return loop(that.reverse(), this);
}

List.prototype.getBinding = function(s) { 
		if(this.n.s == s) return this.n;
		else return this.tail.findBinding(s);
}

List.prototype.findBinding = function(s) { 
		if(this.n.s == s) return this.n.v;
		else return this.tail.findBinding(s);
}

List.prototype.setBinding = function(s, nv) { 
		if(this.n.s == s) this.n.v = nv;
		else return this.tail.setBinding(s, nv);
}
//=============================================================================
function Binding(s, v) {
	this.s = s;
	this.v = v;
}

Binding.prototype.toString = function() {
	return this.s + ' := ' + this.v;
}
