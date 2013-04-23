"use strict";

var TypeCheck = (function() {

	function TypeCheck() { }

	var _tany = new TypeAny();
	var _tbool = new TypeBool();
	var _tfun = new TypeFun();
	var _tnum = new TypeNum();
	var _tpair = new TypePair();
	var _trecord = new TypeRecord();
	var _tunit = new TypeUnit();

	TypeCheck.prototype.visitAdd = function(e) {
		var e1t = e.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: +';

		var e2t = e.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: +';

		return _tnum;
	}

	TypeCheck.prototype.visitAnd = function(e) {
		var e1t = e.e1.accept(this);
		if(!e1t.isBool())
			throw 'Expression does not type check: and';

		var e2t = e.e2.accept(this);
		if(!e2t.isBool())
			throw 'Expression does not type check: and';

		return _tbool;
	}

	TypeCheck.prototype.visitBool = function(e) {
		return _tbool;
	}

	TypeCheck.prototype.visitBoolQ = function(e) {
		e.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitCall = function(e) {
		e.funexp.accept(this);
		if(e.pexp != false) 
			e.pexp.accept(this);
		return _tany;
	}

	TypeCheck.prototype.visitContainsQ = function(e) {
		e.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitDeref = function(e) {
		var et = e.exp.accept(this);
		if(!et.isBool())
			throw 'Expression does not type check: deref';

		return _tany;
	}

	TypeCheck.prototype.visitDiv = function(e) {
		return _tnum;
	}

	TypeCheck.prototype.visitFst = function(e) {
		var et = e.e.accept(this);
		if(!et.isPair())
			throw 'Expression does not type check: fst';
		
		if(et.same(_tpair)) return e.e.e1.accept(this);	
		else return _tany;
	}

	TypeCheck.prototype.visitFun = function(e) {
		return _tfun;
	}

	TypeCheck.prototype.visitGreater = function(e) {
		var e1t = e.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: +';

		var e2t = e.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: +';

		return _tbool;
	}

	TypeCheck.prototype.visitIf = function(e) {
		var eCondt = e.cond.accept(this);
		if(!eCondt.isBool())
			throw 'Expression does not type check: if';

		var e1t = e.e1.accept(this);
		var e2t = e.e2.accept(this);

		if(e1t.same(_tany) || e2t.same(_tany))
			return _tany;

		if(e1t.same(e2t)) {
			if(e1t.isBool()) return _tbool;
			else if(e1t.isBool()) return _tbool;
			else if(e1t.isFun()) return _tfun;
			else if(e1t.isNum()) return _tnum;
			else if(e1t.isPair()) return _tpair;
			else if(e1t.isRecord()) return _trecord;
			else if(e1t.isUnit()) return _tunit;
		} 
		else return _tany;
	}

	TypeCheck.prototype.visitLet = function(e) {
		e.e.accept(this);
		return e.body.accept(this);
	}

	TypeCheck.prototype.visitMod = function(e) {
		var e1t = e.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: %';

		var e2t = e.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: %';

		return _tnum;
	}

	TypeCheck.prototype.visitMul = function(e) {
		var e1t = e.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: *';

		var e2t = e.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: *';

		return _tnum;
	}

	TypeCheck.prototype.visitNot = function(e) {
		var et = e.e.accept(this);
		if(!et.isBool())
			throw 'Expression does not type check: not';

		return _tbool;
	}

	TypeCheck.prototype.visitNum = function(e) {
		return _tnum;
	}

	TypeCheck.prototype.visitNumQ = function(e) {
		e.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitOr = function(e) {
		var e1t = e.e1.accept(this);
		if(!e1t.isBool())
			throw 'Expression does not type check: or';

		var e2t = e.e2.accept(this);
		if(!e2t.isBool())
			throw 'Expression does not type check: or';

		return _tbool;
	}

	TypeCheck.prototype.visitPair = function(e) {
		e.e1.accept(this);
		e.e2.accept(this);
		return _tpair;
	}

	TypeCheck.prototype.visitPairQ = function(e) {
		e.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitPrint = function(e) {
		e.e.accept(this);
		return e.body.accept(this);
	}

	TypeCheck.prototype.visitRecord = function(e) {
		return _trecord;
	}

	TypeCheck.prototype.visitRecordQ = function(e) {
		e.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitSet = function(e) {
		e.e.accept(this);
		return e.body.accept(this);
	}

	TypeCheck.prototype.visitSetFst = function(e) {
		e.e.accept(this);
		return e.body.accept(this);
	}

	TypeCheck.prototype.visitSetSnd = function(e) {
		e.e.accept(this);
		return e.body.accept(this);
	}
	
	TypeCheck.prototype.visitSnd = function(e) {
		var et = e.e.accept(this);
		if(!et.isPair())
			throw 'Expression does not type check: snd';
		
		if(et.same(_tpair)) return e.e.e2.accept(this);	
		else return _tany;
	}

	TypeCheck.prototype.visitSub = function(e) {
		var e1t = e.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: -';

		var e2t = e.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: -';

		return _tnum;
	}

	TypeCheck.prototype.visitUnit = function(e) {
		return _tunit;
	}

	TypeCheck.prototype.visitUnitQ = function(e) {
		e.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitVar = function(e) {
		return _tany;
	}

	TypeCheck.prototype.visitXor = function(e) {
		var e1t = e.e1.accept(this);
		if(!e1t.isBool())
			throw 'Expression does not type check: xor';

		var e2t = e.e2.accept(this);
		if(!e2t.isBool())
			throw 'Expression does not type check: xor';

		return _tbool;
	}

	return TypeCheck;
})(); 