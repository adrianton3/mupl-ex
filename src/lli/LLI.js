exports.LLI = (function () {
	"use strict"

	const Env = require('../Env.js').Env
	const VarBinding = require('../VarBinding.js').VarBinding

	function State (pc, env) { this.pc = pc; this.env = env }
	State.prototype.toString = function () { return '(pc: ' + this.pc + ')' }

	function LLI () {
	}

	LLI.prototype.interpret = function (s) {
		const lines = s.split('\n')
		const ins = lines.map(function (line) {
			return line.split(' ')
		})

		const opStack = []
		let env = Env.Emp
		let curState
		let jumpTo
		let pc = 0


		//-------------------------------------------------------------------------
		let safetyCounter = 0
		const safetyCounterMax = 10000

		while (pc < ins.length) {
			// console.log('===>', pc, ins[pc].join(' '), '| stack: ' + opStack.join(' '));
			safetyCounter++
			if (safetyCounter > safetyCounterMax) {
				throw 'Safety counter reached maximum value'
			}

			switch (ins[pc][0]) {
			case 'push':
				opStack.push(+ins[pc][1])
				pc++
				break
			case '+':
				opStack.push(+opStack.pop() + +opStack.pop())
				pc++
				break
			case '*':
				opStack.push(+opStack.pop() * +opStack.pop())
				pc++
				break
			case '>':
				opStack.push(+opStack.pop() < +opStack.pop())
				pc++
				break
			case 'if':
				if (opStack.pop()) {
					pc++
				}	else {
					jumpTo = ins[pc][1]
					while (!(ins[pc][0] === ':' && ins[pc][1] === jumpTo)) {
						pc++
					}
					pc++
				}
				break
			case 'let':
				env = env.con(new VarBinding(ins[pc][1], opStack.pop(), true))
				pc++
				break
			case 'rem':
				env = env.tail
				pc++
				break
			case 'lookup':
				opStack.push(env.findBinding(ins[pc][1]))
				pc++
				break
			case 'swap':
				opStack.push(opStack.pop(), opStack.pop())
				pc++
				break
			case 'pop-state':
				curState = opStack.pop()
				if (!(curState instanceof State)) { console.warn('popped a non-state'); return }
				env = curState.env
				pc = curState.pc
				break
			case 'push-state':
				opStack.push(new State(pc + +ins[pc][1], env))
				pc++
				break
			case 'jump-down':
				jumpTo = ins[pc][1]
				while (!(ins[pc][0] === ':' && ins[pc][1] === jumpTo)) {
					pc++
				}
				pc++
				break
			case 'clone':
				opStack.push(opStack[opStack.length - 1])
				pc++
				break
			case ':':
				pc++
				break
			case '':
				pc++
				break
			default:
				throw 'LLI: Unknown command' + ins[pc][0]
			}
		}

		if (opStack.length !== 1) {
			console.warn('opStack.length:', opStack.length)
		}
		if (env.length() !== 0) {
			console.warn('env.length:', env.length())
		}

		return opStack
	}

	return LLI
})()
