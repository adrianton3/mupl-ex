"use strict";

var VarCheck = (function() {

	function VarCheck() { }

	VarCheck.prototype.visitAdd = function(add, state) {
		add.e1.accept(this, state);
		add.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitAnd = function(and, state) {
		and.e1.accept(this, state);
		and.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitBool = function(bool, state) {
		return true;
	}

	VarCheck.prototype.visitBoolQ = function(boolQ, state) {
		boolQ.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitCall = function(call, state) {
		call.funexp.accept(this, state);
		if(call.pexp != false) 
			call.pexp.accept(this, state);
		return true;
	}
	
	VarCheck.prototype.visitClosureQ = function(closureQ, state) {
		closureQ.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitContainsQ = function(containsQ, state) {
		containsQ.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitDeref = function(deref, state) {
		deref.exp.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitDiv = function(div, state) {
		div.e1.accept(this, state);
		div.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitFst = function(fst, state) {
		fst.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitFun = function(fun, state) {
		var nState = state;
		
		if(fun.name != false)
			nState = nState.con(new Binding(fun.name));
			
		if(fun.pformal != false)
			nState = nState.con(new Binding(fun.pformal));
			
		fun.body.accept(this, nState);
		
		return true;
	}

	VarCheck.prototype.visitGreater = function(greater, state) {
		greater.e1.accept(this, state);
		greater.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitIf = function(ife, state) {
		ife.cond.accept(this, state);
		ife.e1.accept(this, state);
		ife.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitLet = function(lete, state) {
		lete.e.accept(this, state);
		lete.body.accept(this, state.con(new Binding(lete.name)));
		return true;
	}

	VarCheck.prototype.visitMod = function(mod, state) {
		mod.e1.accept(this, state);
		mod.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitMul = function(mul, state) {
		mul.e1.accept(this, state);
		mul.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitNot = function(not, state) {
		not.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitNum = function(num, state) {
		return true;
	}

	VarCheck.prototype.visitNumQ = function(numQ, state) {
		numQ.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitOr = function(or, state) {
		or.e1.accept(this, state);
		or.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitPair = function(pair, state) {
		pair.e1.accept(this, state);
		pair.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitPairQ = function(pairQ, state) {
		pairQ.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitPrint = function(print, state) {
		print.e.accept(this, state);
		print.body.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitRecord = function(record, state) {
		for(var i in record.map)
			record.map[i].exp.accept(this, state);
			
		return true;
	}

	VarCheck.prototype.visitRecordQ = function(recordQ, state) {
		recordQ.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitSet = function(set, state) {
		set.e.accept(this, state);
		set.body.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitSetFst = function(setFst, state) {
		setFst.e.accept(this, state);
		setFst.body.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitSetSnd = function(setSnd, state) {
		setSnd.e.accept(this, state);
		setSnd.body.accept(this, state);
		return true;
	}
	
	VarCheck.prototype.visitSnd = function(snd, state) {
		snd.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitSub = function(sub, state) {
		sub.e1.accept(this, state);
		sub.e2.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitUnit = function(unit, state) {
		return true;
	}

	VarCheck.prototype.visitUnitQ = function(unitQ, state) {
		unitQ.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitVar = function(vare, state) {
		state.findBinding(vare.name);
		return true;
	}

	VarCheck.prototype.visitXor = function(xor, state) {
		xor.e1.accept(this, state);
		xor.e2.accept(this, state);
		return true;
	}

	return VarCheck;
})(); 