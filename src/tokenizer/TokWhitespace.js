exports.TokWhitespace = (function () {
	"use strict"

	function TokWhitespace (s) {
		this.s = s
	}

	TokWhitespace.prototype.match = function (that) {
		return that instanceof TokWhitespace
	}

	TokWhitespace.prototype.toString = function () {
		return 'Whitespace(' + this.s + ')'
	}

	TokWhitespace.prototype.toHTML = function (c) {
		return this.s == '\n' ? '<br />'
			: this.s == ' ' ? '<span style="color:' + c.whitespace + '">&nbsp;</span>'
			: '<span style="color:' + c.whitespace + '">' + this.s + '</span>'
	}

	return TokWhitespace
})()
