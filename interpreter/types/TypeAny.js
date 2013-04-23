function TypeAny() { }

TypeAny.prototype.isBool = function() { return true; }
TypeAny.prototype.isFun = function() { return true; }
TypeAny.prototype.isNum = function() { return true; }
TypeAny.prototype.isPair = function() { return true; }
TypeAny.prototype.isRecord = function() { return true; }
TypeAny.prototype.isUnit = function() { return true; }

TypeAny.prototype.same = function(that) {
	return that instanceof TypeAny;
}

TypeAny.prototype.match = function(that) {
	return true;
}