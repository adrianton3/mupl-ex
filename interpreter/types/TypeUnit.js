function TypeUnit() { }

TypeUnit.prototype.isBool = function() { return false; }
TypeUnit.prototype.isFun = function() { return false; }
TypeUnit.prototype.isNum = function() { return false; }
TypeUnit.prototype.isPair = function() { return false; }
TypeUnit.prototype.isRecord = function() { return false; }
TypeUnit.prototype.isStr = function() { return false; }
TypeUnit.prototype.isUnit = function() { return true; }

TypeUnit.prototype.same = function(that) {
	return that instanceof TypeUnit;
}

TypeUnit.prototype.match = function(that) {
	return that instanceof TypeUnit || that instanceof TypeAny;
}
