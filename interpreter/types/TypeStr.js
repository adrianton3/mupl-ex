function TypeStr() { }

TypeStr.prototype.isBool = function() { return false; }
TypeStr.prototype.isFun = function() { return false; }
TypeStr.prototype.isNum = function() { return false; }
TypeStr.prototype.isPair = function() { return false; }
TypeStr.prototype.isRecord = function() { return false; }
TypeStr.prototype.isStr = function() { return true; }
TypeStr.prototype.isUnit = function() { return false; }

TypeStr.prototype.same = function(that) {
	return that instanceof TypeStr;
}

TypeStr.prototype.match = function(that) {
	return that instanceof TypeStr || that instanceof TypeAny;
}