const espace = require('../lib/espace.min')
const { buildAst } = require('../src/ast/AstBuilder.js').AstBuilder
const StaticCheck = require('../src/interpreter/StaticCheck.js').StaticCheck
const VarCheckState = require('../src/interpreter/VarCheckState.js').VarCheckState
const Env = require('../src/interpreter/Env.js').Env
const Out = require('../src/interpreter/Out.js').Out

const stdin = process.openStdin()
const stdout = process.stdout

function parse (source) {
	const tokens = espace.Tokenizer()(source)
	return espace.Parser.parse(tokens)
}

stdout.write('> ')
stdin.addListener("data", (data) => {
	const expIn = data.toString()

	let istr = ''
	try {
		const _parsedFreeExp = buildAst(parse(expIn))
		_parsedFreeExp.accept(new StaticCheck(), new VarCheckState(Env.Emp, null))

		Out.reset()

		const res = _parsedFreeExp.ev(Env.Emp)
		istr += res.toString() + '\n'

		const outStr = Out.toString()
		if (outStr.length > 0) {
			istr += 'Out ======\n\n'
			istr += outStr
		}
	} catch (err) {
		istr += err + '\n'
	}

	stdout.write(istr + '\n> ')
})
