function Pretty() { }

Pretty.prototype.visitAdd = function(add, state) {
	var nState = { i : state.i + '   ' };
	var e1s = add.e1.accept(this, nState);
	var e2s = add.e2.accept(this, nState);
	return '(+ ' + e1s + '\n' + nState.i + e2s + ')';
}

Pretty.prototype.visitAnd = function(and, state) {
	var nState = { i : state.i + '   ' };
	var e1s = and.e1.accept(this, nState);
	var e2s = and.e2.accept(this, nState);
	return '(and ' + e1s + '\n' + nState.i + e2s + ')';
}

Pretty.prototype.visitBool = function(bool, state) {
	if(bool.v) return '#t';
	else return '#f';
}

Pretty.prototype.visitBoolQ = function(boolQ, state) {
	var es = boolQ.e.accept(this, state);
	return '(bool? ' + es + ')';
}

Pretty.prototype.visitNum = function(num, state) {
	return num.n + '';
}

Pretty.prototype.visitUnit = function(u, state) {
	return 'unit';
}

Pretty.prototype.visitVar = function(v, state) {
	return v.name;
}