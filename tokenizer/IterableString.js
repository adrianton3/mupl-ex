function IterableString(s) {
	this.s = s;
	this.pointer = 0;
	this.marker = 0;
}

IterableString.prototype.adv = function() {
	this.pointer++;
}

IterableString.prototype.setMarker = function() {
	this.marker = this.pointer;
}

IterableString.prototype.cur = function() {
	return this.s.charAt(this.pointer);
}

IterableString.prototype.next = function() {
	return this.s.charAt(this.pointer + 1);
}

IterableString.prototype.hasNext = function() {
	return this.pointer < this.s.length;
}

IterableString.prototype.getMarked = function() {
	return this.s.substring(this.marker, this.pointer);
}

IterableString.prototype.match = function(str) {
	if(this.s.substring(this.pointer, this.pointer + str.length) == str) {
		this.pointer += str.length;
		return true;
	}
	return false;
}