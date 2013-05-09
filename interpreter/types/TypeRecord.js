function TypeRecord() { }

TypeRecord.prototype.isBool = function() { return false; }
TypeRecord.prototype.isFun = function() { return false; }
TypeRecord.prototype.isNum = function() { return false; }
TypeRecord.prototype.isPair = function() { return false; }
TypeRecord.prototype.isRecord = function() { return true; }
TypeRecord.prototype.isStr = function() { return false; }
TypeRecord.prototype.isUnit = function() { return false; }

TypeRecord.prototype.same = function(that) {
	return that instanceof TypeRecord;
}

TypeRecord.prototype.match = function(that) {
	return that instanceof TypeRecord || that instanceof TypeAny;
}
