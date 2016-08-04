exports.Type = (function () {
	"use strict";
	
	function Type(any, bool, num, str, unit, pair, record, fun) {
		this.any = any;
		this.bool = bool;
		this.num = num;
		this.str = str;
		this.unit = unit;
		this.pair = pair;
		this.record = record;
		this.fun = fun;
	}
	
	Type.prototype.equals = function(that) {
		return (this.any || that.any) || 
			(this.bool == that.bool &&
			this.num == that.num &&
			this.str == that.str &&
			this.unit == that.unit &&
			this.pair == that.pair &&
			this.record == that.record &&
			(this.fun && that.fun ? this.fun.equals(that.fun) : this.fun == that.fun));
	};
	
	Type.prototype.or = function(that) {
		return new Type(this.any || that.any,
			this.bool || that.bool,
			this.num || that.num,
			this.str || that.str,
			this.unit || that.unit,
			this.pair || that.pair,
			this.record || that.record,
			this.fun && that.fun ? this.fun.or(that.fun) : 
				this.fun ? this.fun : that.fun);
	};
	
	Type.prototype.and = function(that) {
		return new Type(this.any && that.any,
			this.bool && that.bool,
			this.num && that.num,
			this.str && that.str,
			this.unit && that.unit,
			this.pair && that.pair,
			this.record && that.record,
			this.fun && that.fun ? this.fun.and(that.fun) : 
				this.fun ? this.fun : that.fun);
	};
	
	Type.prototype.toString = function() { 
		return '(' + 
		  (this.any ? 'any ' : '') + 
			(this.bool ? 'bool ' : '') +  
			(this.num ? 'num ' : '') +
			(this.str ? 'str ' : '') +
			(this.unit ? 'unit ' : '') +
			(this.pair ? 'pair ' : '') +
			(this.record ? 'record ' : '') +
			(this.fun ? 'fun ' : '') +
			')'; 
	};
	
	Type.prototype.isAny    = function() { return this.any; };
	Type.prototype.isBool   = function() { return this.any || this.bool; };
	Type.prototype.isNum    = function() { return this.any || this.num; };
	Type.prototype.isStr    = function() { return this.any || this.str; };
	Type.prototype.isUnit   = function() { return this.any || this.unit; };
	Type.prototype.isPair   = function() { return this.any || this.pair; };
	Type.prototype.isRecord = function() { return this.any || this.record; };
	Type.prototype.isFun    = function() { return this.any || this.fun; };
	
	return Type;
})();