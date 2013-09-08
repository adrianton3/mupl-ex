exports.ToLL = (function() {
	"use strict";
	
	function getU() {
		return Math.random() * 1000 | 0;
	}
		
	function ToLL() { 
	}

	ToLL.prototype.visitAdd = function(add, state) {
		var e1j = add.e1.accept(this, state);
		var e2j = add.e2.accept(this, state);
		
		return e1j + e2j + '+\n';
	};

	ToLL.prototype.visitCall = function(call, state) {
		var funexpj = call.funexp.accept(this, state);		
		var pexpj = call.pexp.accept(this, state);
		
		return pexpj +
			funexpj + 
			'push-state 3\n' +
			'swap\n' +
			'pop-state\n';
	};

	ToLL.prototype.visitFun = function(fun, state) {
		var fname = fun.name;
		var pformalj = fun.pformal;
		var bodyj = fun.body.accept(this, state);
		
		var uEndFun = getU();
		
		var llstr = '';
		
		llstr +=
		  'push-state 2\n' + 
		  'jump-down ' + uEndFun + '\n' +
		  (fname ? 'push-state 0\n' : '') + // 0
		  (fname ? 'let ' + fname + '\n' : '') +
			'swap\n' +
			'let ' + pformalj + '\n' +
			bodyj + 
			//(fname ? 'rem ' + fname + '\n' : '') + // necessary?
			'swap\n' + 
			'pop-state\n' + 
			': ' + uEndFun + '\n';
		
		return llstr;
	};

	ToLL.prototype.visitGreater = function(greater, state) {
		var e1j = greater.e1.accept(this, state);
		var e2j = greater.e2.accept(this, state);
		
		return e1j + e2j + '>\n';
	};

	ToLL.prototype.visitIf = function(ife, state) {
		var eCondj = ife.cond.accept(this, state);
		
		var e1j = ife.e1.accept(this, state);
		var e2j = ife.e2.accept(this, state);
		
		var uIfElse = getU();
		var uIfEnd = getU();

		return eCondj + 
			'if ' + uIfElse + '\n' + 
			e1j + 
			'jump-down ' + uIfEnd + '\n' + 
			': ' + uIfElse + '\n' + 
			e2j + 
			': ' + uIfEnd + '\n';
	};

	ToLL.prototype.visitLet = function(lete, state) {
		var ej = lete.e.accept(this, state);
		var namej = lete.name;
		var bodyj = lete.body.accept(this, state);
		
		return ej + 
			'let ' + namej + '\n' +
			bodyj +
			'rem ' + namej + '\n';
	};

	ToLL.prototype.visitMul = function(mul, state) {
		var e1j = mul.e1.accept(this, state);
		var e2j = mul.e2.accept(this, state);
		
		return e1j + e2j + '*\n';
	};

	ToLL.prototype.visitNum = function(num, state) {
		return 'push ' + num.n + '\n';
	};

	ToLL.prototype.visitVar = function(vare, state) {
		return 'lookup ' + vare.name + '\n';
	};

	return ToLL;
})();