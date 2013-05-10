function TypeBool() { }

TypeBool.prototype.isBool = function() { return true; }
TypeBool.prototype.isFun = function() { return false; }
TypeBool.prototype.isNum = function() { return false; }
TypeBool.prototype.isPair = function() { return false; }
TypeBool.prototype.isRecord = function() { return false; }
TypeBool.prototype.isStr = function() { return false; }
TypeBool.prototype.isUnit = function() { return false; }

TypeBool.prototype.same = function(that) {
	return that instanceof TypeBool;
}

TypeBool.prototype.match = function(that) {
	return that instanceof TypeBool || that instanceof TypeAny;
}
