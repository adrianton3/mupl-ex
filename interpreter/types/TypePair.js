function TypePair() { }

TypePair.prototype.isBool = function() { return false; }
TypePair.prototype.isFun = function() { return false; }
TypePair.prototype.isNum = function() { return false; }
TypePair.prototype.isPair = function() { return true; }
TypePair.prototype.isRecord = function() { return false; }
TypePair.prototype.isStr = function() { return false; }
TypePair.prototype.isUnit = function() { return false; }

TypePair.prototype.same = function(that) {
	return that instanceof TypePair;
}

TypePair.prototype.match = function(that) {
	return that instanceof TypePair || that instanceof TypeAny;
}
