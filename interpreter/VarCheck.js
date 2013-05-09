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
		for(var i in containsQ.list)
			if(containsQ.list[i].indexOf('.') != -1) throw 'Member names can not contain "."';
		
		containsQ.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitDef = function(def, state) {
		if(def.defName.indexOf('.') != -1) throw 'Def name can not contain "."';
		def.fun.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitDeref = function(deref, state) {
		if(deref.name.indexOf('.') != -1) throw 'Member names can not contain "."';
		deref.exp.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitDiv = function(div, state) {
		div.e1.accept(this, state);
		div.e2.accept(this, state);
		return true;
	}
	
	VarCheck.prototype.visitErr = function(err, state) {
		err.e.accept(this, state);
		return true;
	}
	
	VarCheck.prototype.visitFst = function(fst, state) {
		fst.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitFun = function(fun, state) {
		var nState = state;
		
		if(fun.name != false) {
			if(fun.name.indexOf('.') != -1) throw 'Function name cannot contain a "."';
			nState = nState.con(new Binding(fun.name));
		}
		
		if(fun.pformal != false) {
			if(fun.pformal.indexOf('.') != -1) throw 'Function parameter cannot contain a "."';
			nState = nState.con(new Binding(fun.pformal));
		}
		
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
		if(lete.name.indexOf('.') != -1) throw 'Let binding cannot contain a "."';
		lete.e.accept(this, state);
		lete.body.accept(this, state.con(new Binding(lete.name)));
		return true;
	}

	VarCheck.prototype.visitMod = function(mod, state) {
		mod.e1.accept(this, state);
		mod.e2.accept(this, state);
		return true;
	}
	
	VarCheck.prototype.visitModuleSet = function(modSet, state) {
		for(var i in modSet.mods)
			modSet.mods[i].accept(this, new VarCheckState(modSet.mods[i].privateEnv, state.modSet));
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
		for(var i in record.map) {
			if(record.map[i].name.indexOf('.') != -1) throw 'Record member name can not contain "."';
			record.map[i].exp.accept(this, state);
		}
			
		return true;
	}

	VarCheck.prototype.visitRecordQ = function(recordQ, state) {
		recordQ.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitSet = function(set, state) {
		if(set.name.indexOf('.') != -1) throw 'Set can be applied only on local variables';
		set.e.accept(this, state);
		set.body.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitSetFst = function(setFst, state) {
		if(setFst.name.indexOf('.') != -1) throw 'SetFst can be applied only on local variables';
		setFst.e.accept(this, state);
		setFst.body.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitSetSnd = function(setSnd, state) {
		if(setSnd.name.indexOf('.') != -1) throw 'SetSnd can be applied only on local variables';
		setSnd.e.accept(this, state);
		setSnd.body.accept(this, state);
		return true;
	}
	
	VarCheck.prototype.visitSnd = function(snd, state) {
		snd.e.accept(this, state);
		return true;
	}

	VarCheck.prototype.visitStr = function(str, state) {
		return true;
	}
	
	VarCheck.prototype.visitStrQ = function(strQ, state) {
		strQ.e.accept(this, state);
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
		if(vare.extern) state.modSet.getVal(vare.name);
		else state.env.findBinding(vare.name);
		return true;
	}

	VarCheck.prototype.visitXor = function(xor, state) {
		xor.e1.accept(this, state);
		xor.e2.accept(this, state);
		return true;
	}

	return VarCheck;
})();
//=============================================================================
function VarCheckState(env, modSet) {
	this.env = env;
	this.modSet = modSet;
}

VarCheckState.prototype.con = function(b) {
	return new VarCheckState(this.env.con(b), this.modSet);
}
