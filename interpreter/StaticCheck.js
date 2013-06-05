"use strict";

var StaticCheck = (function() {

	function StaticCheck() { }

	var _tany = new TypeAny();
	var _tbool = new TypeBool();
	var _tfun = new TypeFun();
	var _tnum = new TypeNum();
	var _tpair = new TypePair();
	var _trecord = new TypeRecord();
	var _tstr = new TypeStr();
	var _tunit = new TypeUnit();

	StaticCheck.prototype.visitAdd = function(add, state) {
		var e1t = add.e1.accept(this, state);
		if(!e1t.isNum())
			throw 'Expression does not type check: + ' + add.tokenCoords;

		var e2t = add.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: + ' + add.tokenCoords;

		return _tnum;
	}

	StaticCheck.prototype.visitAnd = function(and, state) {
		var e1t = and.e1.accept(this, state);
		if(!e1t.isBool())
			throw 'Expression does not type check: and ' + add.tokenCoords;

		var e2t = and.e2.accept(this, state);
		if(!e2t.isBool())
			throw 'Expression does not type check: and ' + add.tokenCoords;

		return _tbool;
	}
	
	StaticCheck.prototype.visitAny = function(unit, state) {
		return _tany;
	}

	StaticCheck.prototype.visitBool = function(bool, state) {
		return _tbool;
	}

	StaticCheck.prototype.visitBoolQ = function(boolQ, state) {
		boolQ.e.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitCall = function(call, state) {
		call.funexp.accept(this, state);
		if(call.pexp != false) 
			call.pexp.accept(this, state);
		return _tany;
	}
	
	StaticCheck.prototype.visitClosureQ = function(closureQ, state) {
		closureQ.e.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitContainsQ = function(containsQ, state) {
		for(var i in containsQ.list)
			if(containsQ.list[i].indexOf('.') != -1) throw 'Member names (' + containsQ.list[i] + ') can not contain "." ' + add.tokenCoords;
			
		containsQ.e.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitDef = function(def, state) {
		if(def.defName.indexOf('.') != -1) throw 'Def name (' + def.defName + ') can not contain "."';
		def.fun.accept(this, state);
		return _tany;
	}

	StaticCheck.prototype.visitDeref = function(deref, state) {
		if(deref.name.indexOf('.') != -1) throw 'Member name (' + deref.name + ') can not contain "." ' + add.tokenCoords;
		
		var et = deref.exp.accept(this, state);
		if(!et.isRecord())
			throw 'Expression does not type check: deref ' + add.tokenCoords;

		return _tany;
	}

	StaticCheck.prototype.visitDiv = function(div, state) {
		var e1t = div.e1.accept(this, state);
		if(!e1t.isNum())
			throw 'Expression does not type check: / ' + add.tokenCoords;

		var e2t = div.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: / ' + add.tokenCoords;
			
		return _tnum;
	}
	
	StaticCheck.prototype.visitErr = function(err, state) {
		err.e.accept(this, state);
		return _tany;
	}
	
	StaticCheck.prototype.visitFst = function(fst, state) {
		var et = fst.e.accept(this, state);
		if(!et.isPair())
			throw 'Expression does not type check: fst ' + add.tokenCoords;
		
		if(et.same(_tpair)) return fst.e.e1.accept(this, state);	
		else return _tany;
	}

	StaticCheck.prototype.visitFun = function(fun, state) {
		var nState = state;
		
		if(fun.name != false) {
			if(fun.name.indexOf('.') != -1) throw 'Function name (' + fun.name + ') cannot contain a "." ' + add.tokenCoords;
			nState = nState.con(new TypeBinding(fun.name, _tfun, true));
		}
		
		if(fun.pformal != false) {
			if(fun.pformal.indexOf('.') != -1) throw 'Function parameter (' + fun.pformal + ') cannot contain a "." ' + add.tokenCoords;
			nState = nState.con(new TypeBinding(fun.pformal, _tany, true));
		}
		
		fun.body.accept(this, nState);
		
		return _tfun;
	}

	StaticCheck.prototype.visitGreater = function(greater, state) {
		var e1t = greater.e1.accept(this, state);
		if(!e1t.isNum())
			throw 'Expression does not type check: > ' + add.tokenCoords;

		var e2t = greater.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: > ' + add.tokenCoords;

		return _tbool;
	}

	StaticCheck.prototype.visitIf = function(ife, state) {
		var eCondt = ife.cond.accept(this, state);
		if(!eCondt.isBool())
			throw 'Expression does not type check: if ' + add.tokenCoords;

		var e1t = ife.e1.accept(this, state);
		var e2t = ife.e2.accept(this, state);

		if(e1t.same(_tany) || e2t.same(_tany))
			return _tany;

		if(e1t.same(e2t)) {
			if(e1t.isBool()) return _tbool;
			else if(e1t.isFun()) return _tfun;
			else if(e1t.isNum()) return _tnum;
			else if(e1t.isPair()) return _tpair;
			else if(e1t.isRecord()) return _trecord;
			else if(e1t.isStr()) return _tstr;
			else if(e1t.isUnit()) return _tunit;
		} 
		else return _tany;
	}

	StaticCheck.prototype.visitLet = function(lete, state) {
		if(lete.name.indexOf('.') != -1) throw 'Let binding (' + lete.name + ') cannot contain a "." ' + add.tokenCoords;
		
		var et;
		if(lete.final) et = lete.e.accept(this, state);
		else { et = _tany; lete.e.accept(this, state); }
		
		var nState = state.con(new TypeBinding(lete.name, et, lete.final));
		return lete.body.accept(this, nState);
	}

	StaticCheck.prototype.visitMod = function(mod, state) {
		var e1t = mod.e1.accept(this, state);
		if(!e1t.isNum())
			throw 'Expression does not type check: % ' + add.tokenCoords;

		var e2t = mod.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: % ' + add.tokenCoords;

		return _tnum;
	}
	
	StaticCheck.prototype.visitModule = function(module, state) {
		for(var i in module.defs)
			module.defs[i].accept(this, state);
			
		return _tany;
	}
	
	StaticCheck.prototype.visitModuleSet = function(modSet, state) {
		for(var i in modSet.mods)
			modSet.mods[i].accept(this, 
				new VarCheckState(modSet.mods[i].privateEnv, state.modSet));
			
		return _tany;
	}

	StaticCheck.prototype.visitMul = function(mul, state) {
		var e1t = mul.e1.accept(this, state);
		if(!e1t.isNum())
			throw 'Expression does not type check: * ' + add.tokenCoords;

		var e2t = mul.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: * ' + add.tokenCoords;

		return _tnum;
	}

	StaticCheck.prototype.visitNot = function(not, state) {
		var et = not.e.accept(this, state);
		if(!et.isBool())
			throw 'Expression does not type check: not ' + add.tokenCoords;

		return _tbool;
	}

	StaticCheck.prototype.visitNum = function(num, state) {
		return _tnum;
	}

	StaticCheck.prototype.visitNumQ = function(numQ, state) {
		numQ.e.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitOr = function(or, state) {
		var e1t = or.e1.accept(this, state);
		if(!e1t.isBool())
			throw 'Expression does not type check: or ' + add.tokenCoords;

		var e2t = or.e2.accept(this, state);
		if(!e2t.isBool())
			throw 'Expression does not type check: or ' + add.tokenCoords;

		return _tbool;
	}

	StaticCheck.prototype.visitPair = function(pair, state) {
		pair.e1.accept(this, state);
		pair.e2.accept(this, state);
		return _tpair;
	}

	StaticCheck.prototype.visitPairQ = function(pairQ, state) {
		pairQ.e.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitPrint = function(print, state) {
		print.e.accept(this, state);
		return print.body.accept(this, state);
	}

	StaticCheck.prototype.visitRecord = function(record, state) {
		for(var i in record.map) {
			if(record.map[i].name.indexOf('.') != -1) throw 'Record member name (' + record.map[i].name + ')can not contain "." ' + add.tokenCoords;
			record.map[i].exp.accept(this, state);
		}
			
		return _trecord;
	}

	StaticCheck.prototype.visitRecordQ = function(recordQ, state) {
		recordQ.e.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitSet = function(set, state) {
		if(set.name.indexOf('.') != -1) throw 'Set can be applied only on local variables ' + add.tokenCoords;
		
		var binding = state.env.getBinding(set.name);
		if(binding.final && !set.bang) throw set.name + ' is final ' + add.tokenCoords;
		
		var et = set.e.accept(this, state);
		if(set.bang) binding.v = et;
		
		return set.body.accept(this, state);
	}

	StaticCheck.prototype.visitSetFst = function(setFst, state) {
		if(setFst.name.indexOf('.') != -1) throw 'SetFst can be applied only on local variables ' + add.tokenCoords;
		
		var bt = state.env.findBinding(setFst.name);
		if(!bt.isPair())
			throw 'Cannot apply setfst! on non-pair ' + add.tokenCoords;
		
		setFst.e.accept(this, state);
		return setFst.body.accept(this, state);
	}

	StaticCheck.prototype.visitSetSnd = function(setSnd, state) {
		if(setSnd.name.indexOf('.') != -1) throw 'SetSnd can be applied only on local variables ' + add.tokenCoords;
		
		var bt = state.env.findBinding(setSnd.name);
		if(!bt.isPair())
			throw 'Cannot apply setsnd! on non-pair ' + add.tokenCoords;
		
		setSnd.e.accept(this, state);
		return setSnd.body.accept(this, state);
	}
	
	StaticCheck.prototype.visitSnd = function(snd, state) {
		var et = snd.e.accept(this, state);
		if(!et.isPair())
			throw 'Expression does not type check: snd ' + add.tokenCoords;
		
		if(et.same(_tpair)) return snd.e.e2.accept(this, state);	
		else return _tany;
	}

	StaticCheck.prototype.visitStr = function(str, state) {
		return _tstr;
	}
	
	StaticCheck.prototype.visitStrQ = function(strQ, state) {
		strQ.e.accept(this, state);
		return _tbool;
	}
	
	StaticCheck.prototype.visitSub = function(sub, state) {
		var e1t = sub.e1.accept(this, state);
		if(!e1t.isNum())
			throw 'Expression does not type check: - ' + add.tokenCoords;

		var e2t = sub.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: - ' + add.tokenCoords;

		return _tnum;
	}

	StaticCheck.prototype.visitUnit = function(unit, state) {
		return _tunit;
	}

	StaticCheck.prototype.visitUnitQ = function(unitQ, state) {
		unitQ.e.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitVar = function(vare, state) {
		if(vare.extern) {
			state.modSet.getVal(vare.name);
			return _tfun;
		}
		else
			return state.env.findBinding(vare.name);
	}

	StaticCheck.prototype.visitXor = function(xor, state) {
		var e1t = xor.e1.accept(this, state);
		if(!e1t.isBool())
			throw 'Expression does not type check: xor ' + add.tokenCoords;

		var e2t = xor.e2.accept(this, state);
		if(!e2t.isBool())
			throw 'Expression does not type check: xor ' + add.tokenCoords;

		return _tbool;
	}

	return StaticCheck;
})();
//=============================================================================
function TypeBinding(s, v, final) {
	this.s = s;
	this.v = v;
	this.final = final;
}

TypeBinding.prototype.toString = function() {
	if(this.final) return this.s + ' :: ' + this.v;
	else return this.s + ' *: ' + this.v;
}
//=============================================================================
function VarCheckState(env, modSet) {
	this.env = env;
	this.modSet = modSet;
}

VarCheckState.prototype.con = function(b) {
	return new VarCheckState(this.env.con(b), this.modSet);
}
 