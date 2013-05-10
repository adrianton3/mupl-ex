function TypeNum() { }

TypeNum.prototype.isBool = function() { return false; }
TypeNum.prototype.isFun = function() { return false; }
TypeNum.prototype.isNum = function() { return true; }
TypeNum.prototype.isPair = function() { return false; }
TypeNum.prototype.isRecord = function() { return false; }
TypeNum.prototype.isStr = function() { return false; }
TypeNum.prototype.isUnit = function() { return false; }

TypeNum.prototype.same = function(that) {
	return that instanceof TypeNum;
}

TypeNum.prototype.match = function(that) {
	return that instanceof TypeNum || that instanceof TypeAny;
}
