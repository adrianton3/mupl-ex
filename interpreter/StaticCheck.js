exports.StaticCheck = (function() {
	"use strict";
	
	var Closure = require('./nodes/Closure.js').Closure;
	var Type = require('./types/Type.js').Type;
	var TypeBinding = require('./TypeBinding.js').TypeBinding;
	var VarCheckState = require('./VarCheckState.js').VarCheckState;
	var TokenCoords = require('../tokenizer/TokenCoords.js').TokenCoords;

	function StaticCheck() { }

	var _tvid    = new Type(false, false, false, false, false, false, false, false);
	var _tany    = new Type( true, false, false, false, false, false, false, false);
	var _tbool   = new Type(false,  true, false, false, false, false, false, false);
	var _tnum    = new Type(false, false,  true, false, false, false, false, false);
	var _tstr    = new Type(false, false, false,  true, false, false, false, false);
	var _tunit   = new Type(false, false, false, false,  true, false, false, false);
	var _tpair   = new Type(false, false, false, false, false,  true, false, false);
	var _trecord = new Type(false, false, false, false, false, false,  true, false);
	var _tfun    = new Type(false, false, false, false, false, false, false, _tvid);

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
			throw 'Expression does not type check: and ' + and.tokenCoords;

		var e2t = and.e2.accept(this, state);
		if(!e2t.isBool())
			throw 'Expression does not type check: and ' + and.tokenCoords;

		return _tbool;
	}
	
	StaticCheck.prototype.visitAny = function(unit, state) {
		return _tany;
	}
	
	StaticCheck.prototype.visitArrJS = function(arrJS, state) {
		for(var i in arrJS.indexExps) {
			arrJS.indexExps[i].accept(this, state);
		}
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
		var funexpt;

		funexpt = call.funexp.accept(this, state);
		
    if(funexpt instanceof Closure) {
    	if(funexpt.fun.type) funexpt = funexpt.fun.type;
    	else funexpt = _tany;
    }
    else {
    	
    }
    
		if(!funexpt.isFun())
			throw 'Expression does not type check: call ' + call.tokenCoords;
		
		if(call.pexp != false) 
			call.pexp.accept(this, state);
		
		if(funexpt.isAny()) return _tany;
		return funexpt.fun;
	}
	
	StaticCheck.prototype.visitCallJS = function(callJS, state) {
		for(var i in callJS.parameterExps) {
			callJS.parameterExps[i].accept(this, state);
		}
		return _tany;
	}
	
	StaticCheck.prototype.visitClosureQ = function(closureQ, state) {
		closureQ.e.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitContainsQ = function(containsQ, state) {
		for(var i in containsQ.list)
			if(containsQ.list[i].indexOf('.') != -1) throw 'Member names (' + containsQ.list[i] + ') can not contain "." ' + containsQ.tokenCoords;
			
		containsQ.exp.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitDef = function(def, state) {
		if(def.defName.indexOf('.') != -1) throw 'Def name (' + def.defName + ') can not contain "."';
		var funt = def.fun.accept(this, state);
		return funt;
	}

	StaticCheck.prototype.visitDeref = function(deref, state) {
		if(deref.name.indexOf('.') != -1) throw 'Member name (' + deref.name + ') can not contain "." ' + deref.tokenCoords;
		
		var et = deref.exp.accept(this, state);
		if(!et.isRecord())
			throw 'Expression does not type check: deref ' + deref.tokenCoords;

		return _tany;
	}

	StaticCheck.prototype.visitDiv = function(div, state) {
		var e1t = div.e1.accept(this, state);
		if(!e1t.isNum())
			throw 'Expression does not type check: / ' + div.tokenCoords;

		var e2t = div.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: / ' + div.tokenCoords;
			
		return _tnum;
	}
	
	StaticCheck.prototype.visitErr = function(err, state) {
		err.e.accept(this, state);
		return _tany;
	}
	
	StaticCheck.prototype.visitFst = function(fst, state) {
		var et = fst.e.accept(this, state);
		if(!et.isPair())
			throw 'Expression does not type check: fst ' + fst.tokenCoords;
		
		if(et.equals(_tpair)) return fst.e.e1.accept(this, state);	
		else return _tany;
	}

	StaticCheck.prototype.visitFun = function(fun, state) {
		var nState = state;
		
		if(fun.name != false) {
			if(fun.name.indexOf('.') != -1) throw 'Function name (' + fun.name + ') cannot contain a "." ' + fun.tokenCoords;
			nState = nState.con(new TypeBinding(fun.name, _tfun, true));
		}
		
		if(fun.pformal != false) {
			if(fun.pformal.indexOf('.') != -1) throw 'Function parameter (' + fun.pformal + ') cannot contain a "." ' + fun.tokenCoords;
			nState = nState.con(new TypeBinding(fun.pformal, _tany, true));
		}
		
		var bodyt = fun.body.accept(this, nState);
		
		return new Type(false, false, false, false, false, false, false, bodyt);
	}

	StaticCheck.prototype.visitGreater = function(greater, state) {
		var e1t = greater.e1.accept(this, state);
		if(!e1t.isNum())
			throw 'Expression does not type check: > ' + greater.tokenCoords;

		var e2t = greater.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: > ' + greater.tokenCoords;

		return _tbool;
	}

	StaticCheck.prototype.visitIf = function(ife, state) {
		var eCondt = ife.cond.accept(this, state);
		if(!eCondt.isBool())
			throw 'Expression does not type check: if ' + ife.tokenCoords;

		var e1t = ife.e1.accept(this, state);
		var e2t = ife.e2.accept(this, state);

		return e1t.or(e2t);
	}

	StaticCheck.prototype.visitLet = function(lete, state) {
		if(lete.name.indexOf('.') != -1) throw 'Let binding (' + lete.name + ') cannot contain a "." ' + lete.tokenCoords;
		
		var et;
		if(lete.final) et = lete.e.accept(this, state);
		else { et = _tany; lete.e.accept(this, state); }
		
		var nState = state.con(new TypeBinding(lete.name, et, lete.final));
		return lete.body.accept(this, nState);
	}

	StaticCheck.prototype.visitMod = function(mod, state) {
		var e1t = mod.e1.accept(this, state);
		if(!e1t.isNum())
			throw 'Expression does not type check: % ' + mod.tokenCoords;

		var e2t = mod.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: % ' + mod.tokenCoords;

		return _tnum;
	}
	
	StaticCheck.prototype.visitModule = function(module, state) {
		for(var i in module.defs) {
			var deft = module.defs[i].accept(this, state);
			module.defs[i].fun.type = deft;
		}
			
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
			throw 'Expression does not type check: * ' + mul.tokenCoords;

		var e2t = mul.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: * ' + mul.tokenCoords;

		return _tnum;
	}

	StaticCheck.prototype.visitNot = function(not, state) {
		var et = not.e.accept(this, state);
		if(!et.isBool())
			throw 'Expression does not type check: not ' + not.tokenCoords;

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
			throw 'Expression does not type check: or ' + or.tokenCoords;

		var e2t = or.e2.accept(this, state);
		if(!e2t.isBool())
			throw 'Expression does not type check: or ' + or.tokenCoords;

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
		for(var key in record.map) {
			if(key.indexOf('.') !== -1) throw 'Record member name (' + key + ')can not contain "." ' + record.tokenCoords;
			record.map[key].accept(this, state);
		}
			
		return _trecord;
	}

	StaticCheck.prototype.visitRecordQ = function(recordQ, state) {
		recordQ.e.accept(this, state);
		return _tbool;
	}

	StaticCheck.prototype.visitSet = function(set, state) {
		if(set.name.indexOf('.') !== -1) throw 'Set can be applied only on local variables ' + set.tokenCoords;
		
		var binding = state.env.getBinding(set.name);
		if(binding.final && !set.bang) throw set.name + ' is final ' + set.tokenCoords;
		
		var et = set.e.accept(this, state);
		if(set.bang) binding.v = et;
		
		return set.body.accept(this, state);
	}

	StaticCheck.prototype.visitSetFst = function(setFst, state) {
		if(setFst.name.indexOf('.') != -1) throw 'SetFst can be applied only on local variables ' + setFst.tokenCoords;
		
		var bt = state.env.findBinding(setFst.name);
		if(!bt.isPair())
			throw 'Cannot apply setfst! on non-pair ' + setFst.tokenCoords;
		
		setFst.e.accept(this, state);
		return setFst.body.accept(this, state);
	}

	StaticCheck.prototype.visitSetSnd = function(setSnd, state) {
		if(setSnd.name.indexOf('.') != -1) throw 'SetSnd can be applied only on local variables ' + setSnd.tokenCoords;
		
		var bt = state.env.findBinding(setSnd.name);
		if(!bt.isPair())
			throw 'Cannot apply setsnd! on non-pair ' + setSnd.tokenCoords;
		
		setSnd.e.accept(this, state);
		return setSnd.body.accept(this, state);
	}
	
	StaticCheck.prototype.visitSnd = function(snd, state) {
		var et = snd.e.accept(this, state);
		if(!et.isPair())
			throw 'Expression does not type check: snd ' + snd.tokenCoords;
		
		if(et.equals(_tpair)) return snd.e.e2.accept(this, state);	
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
			throw 'Expression does not type check: - ' + sub.tokenCoords;

		var e2t = sub.e2.accept(this, state);
		if(!e2t.isNum())
			throw 'Expression does not type check: - ' + sub.tokenCoords;

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
			var def = state.modSet.getVal(vare.name);
			if(def.fun.type) return def.fun.type;
			return _tany;
		}
		else
			return state.env.findBinding(vare.name);
	}

	StaticCheck.prototype.visitXor = function(xor, state) {
		var e1t = xor.e1.accept(this, state);
		if(!e1t.isBool())
			throw 'Expression does not type check: xor ' + xor.tokenCoords;

		var e2t = xor.e2.accept(this, state);
		if(!e2t.isBool())
			throw 'Expression does not type check: xor ' + xor.tokenCoords;

		return _tbool;
	}

	return StaticCheck;
})();