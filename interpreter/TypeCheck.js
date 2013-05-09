"use strict";

var TypeCheck = (function() {

	function TypeCheck() { }

	var _tany = new TypeAny();
	var _tbool = new TypeBool();
	var _tfun = new TypeFun();
	var _tnum = new TypeNum();
	var _tpair = new TypePair();
	var _trecord = new TypeRecord();
	var _tstr = new TypeStr();
	var _tunit = new TypeUnit();

	TypeCheck.prototype.visitAdd = function(add) {
		var e1t = add.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: +';

		var e2t = add.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: +';

		return _tnum;
	}

	TypeCheck.prototype.visitAnd = function(and) {
		var e1t = and.e1.accept(this);
		if(!e1t.isBool())
			throw 'Expression does not type check: and';

		var e2t = and.e2.accept(this);
		if(!e2t.isBool())
			throw 'Expression does not type check: and';

		return _tbool;
	}

	TypeCheck.prototype.visitBool = function(bool) {
		return _tbool;
	}

	TypeCheck.prototype.visitBoolQ = function(boolQ) {
		boolQ.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitCall = function(call) {
		call.funexp.accept(this);
		if(call.pexp != false) 
			call.pexp.accept(this);
		return _tany;
	}
	
	TypeCheck.prototype.visitClosureQ = function(closureQ) {
		closureQ.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitContainsQ = function(containsQ) {
		containsQ.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitDef = function(def) {
		def.fun.accept(this);
		return _tany;
	}

	TypeCheck.prototype.visitDeref = function(deref) {
		var et = deref.exp.accept(this);
		if(!et.isRecord())
			throw 'Expression does not type check: deref';

		return _tany;
	}

	TypeCheck.prototype.visitDiv = function(div) {
		var e1t = div.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: /';

		var e2t = div.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: /';
			
		return _tnum;
	}
	
	TypeCheck.prototype.visitErr = function(err) {
		err.e.accept(this);
		return _tany;
	}
	
	TypeCheck.prototype.visitFst = function(fst) {
		var et = fst.e.accept(this);
		if(!et.isPair())
			throw 'Expression does not type check: fst';
		
		if(et.same(_tpair)) return fst.e.e1.accept(this);	
		else return _tany;
	}

	TypeCheck.prototype.visitFun = function(fun) {
		fun.body.accept(this);
		return _tfun;
	}

	TypeCheck.prototype.visitGreater = function(greater) {
		var e1t = greater.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: >';

		var e2t = greater.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: >';

		return _tbool;
	}

	TypeCheck.prototype.visitIf = function(ife) {
		var eCondt = ife.cond.accept(this);
		if(!eCondt.isBool())
			throw 'Expression does not type check: if';

		var e1t = ife.e1.accept(this);
		var e2t = ife.e2.accept(this);

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

	TypeCheck.prototype.visitLet = function(lete) {
		lete.e.accept(this);
		return lete.body.accept(this);
	}

	TypeCheck.prototype.visitMod = function(mod) {
		var e1t = mod.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: %';

		var e2t = mod.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: %';

		return _tnum;
	}
	
	TypeCheck.prototype.visitModuleSet = function(modSet) {
		for(var i in modSet.mods)
			modSet.mods[i].accept(this);
			
		return _tany;
	}

	TypeCheck.prototype.visitMul = function(mul) {
		var e1t = mul.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: *';

		var e2t = mul.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: *';

		return _tnum;
	}

	TypeCheck.prototype.visitNot = function(not) {
		var et = not.e.accept(this);
		if(!et.isBool())
			throw 'Expression does not type check: not';

		return _tbool;
	}

	TypeCheck.prototype.visitNum = function(num) {
		return _tnum;
	}

	TypeCheck.prototype.visitNumQ = function(numQ) {
		numQ.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitOr = function(or) {
		var e1t = or.e1.accept(this);
		if(!e1t.isBool())
			throw 'Expression does not type check: or';

		var e2t = or.e2.accept(this);
		if(!e2t.isBool())
			throw 'Expression does not type check: or';

		return _tbool;
	}

	TypeCheck.prototype.visitPair = function(pair) {
		pair.e1.accept(this);
		pair.e2.accept(this);
		return _tpair;
	}

	TypeCheck.prototype.visitPairQ = function(pairQ) {
		pairQ.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitPrint = function(print) {
		print.e.accept(this);
		return print.body.accept(this);
	}

	TypeCheck.prototype.visitRecord = function(record) {
		for(var i in record.map)
			record.map[i].exp.accept(this);
			
		return _trecord;
	}

	TypeCheck.prototype.visitRecordQ = function(recordQ) {
		recordQ.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitSet = function(set) {
		set.e.accept(this);
		return set.body.accept(this);
	}

	TypeCheck.prototype.visitSetFst = function(setFst) {
		setFst.e.accept(this);
		return setFst.body.accept(this);
	}

	TypeCheck.prototype.visitSetSnd = function(setSnd) {
		setSnd.e.accept(this);
		return setSnd.body.accept(this);
	}
	
	TypeCheck.prototype.visitSnd = function(snd) {
		var et = snd.e.accept(this);
		if(!et.isPair())
			throw 'Expression does not type check: snd';
		
		if(et.same(_tpair)) return snd.e.e2.accept(this);	
		else return _tany;
	}

	TypeCheck.prototype.visitStr = function(str) {
		return _tstr;
	}
	
	TypeCheck.prototype.visitStrQ = function(strQ) {
		strQ.e.accept(this);
		return _tbool;
	}
	
	TypeCheck.prototype.visitSub = function(sub) {
		var e1t = sub.e1.accept(this);
		if(!e1t.isNum())
			throw 'Expression does not type check: -';

		var e2t = sub.e2.accept(this);
		if(!e2t.isNum())
			throw 'Expression does not type check: -';

		return _tnum;
	}

	TypeCheck.prototype.visitUnit = function(unit) {
		return _tunit;
	}

	TypeCheck.prototype.visitUnitQ = function(unitQ) {
		unitQ.e.accept(this);
		return _tbool;
	}

	TypeCheck.prototype.visitVar = function(vare) {
		if(vare.extern) return _tfun;
		else return _tany;
	}

	TypeCheck.prototype.visitXor = function(xor) {
		var e1t = xor.e1.accept(this);
		if(!e1t.isBool())
			throw 'Expression does not type check: xor';

		var e2t = xor.e2.accept(this);
		if(!e2t.isBool())
			throw 'Expression does not type check: xor';

		return _tbool;
	}

	return TypeCheck;
})(); 