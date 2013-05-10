function TypeFun() { }

TypeFun.prototype.isBool = function() { return false; }
TypeFun.prototype.isFun = function() { return true; }
TypeFun.prototype.isNum = function() { return false; }
TypeFun.prototype.isPair = function() { return false; }
TypeFun.prototype.isRecord = function() { return false; }
TypeFun.prototype.isStr = function() { return false; }
TypeFun.prototype.isUnit = function() { return false; }

TypeFun.prototype.same = function(that) {
	return that instanceof TypeFun;
}

TypeFun.prototype.match = function(that) {
	return that instanceof TypeFun || that instanceof TypeAny;
}