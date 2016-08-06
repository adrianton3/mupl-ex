exports.Tokenizer = (function () {
	"use strict"

	const IterableString = require('./IterableString.js').IterableString
	const TokEnd = require('./TokEnd.js').TokEnd
	const TokNum = require('./TokNum.js').TokNum
	const TokIdentifier = require('./TokIdentifier.js').TokIdentifier
	const TokBool = require('./TokBool.js').TokBool
	const TokStr = require('./TokStr.js').TokStr
	const TokLPar = require('./TokLPar.js').TokLPar
	const TokRPar = require('./TokRPar.js').TokRPar
	const TokKeyword = require('./TokKeyword.js').TokKeyword
	const TokWhitespace = require('./TokWhitespace.js').TokWhitespace
	const TokCommSL = require('./TokCommSL.js').TokCommSL
	const TokCommML = require('./TokCommML.js').TokCommML
	const TokenCoords = require('./TokenCoords.js').TokenCoords

	function Tokenizer () { }

	Tokenizer.chop = function (s, ws, comm) {
		if (ws === undefined) { ws = false }
		if (comm === undefined) { comm = false }

		const str = new IterableString(s + ' ')
		const tok = []

		while (str.hasNext()) {
			const c = str.cur()

			if (c === "'") {
				tok.push(Tokenizer.chop.strs(str))
			} else if (c === '"') {
				tok.push(Tokenizer.chop.strd(str))
			} else if (c === '/') {
				const n = str.next()
				if (n === '/') {
					const tmp = Tokenizer.chop.commsl(str)
					if (comm) { tok.push(tmp) }
				} else if (n === '*') {
					const tmp = Tokenizer.chop.commml(str)
					if (comm) { tok.push(tmp) }
				} else {
					tok.push(Tokenizer.chop.alphanum(str))
				}
			} else if (c >= '0' && c <= '9') {
				tok.push(Tokenizer.chop.num(str))
			} else if (c === '(') {
				tok.push(new TokLPar(str.getCoords()))
				str.adv()
			} else if (c === ')') {
				tok.push(new TokRPar(str.getCoords()))
				str.adv()
			} else if (c > ' ' && c <= '~') {
				tok.push(Tokenizer.chop.alphanum(str))
			} else {
				const tmp = Tokenizer.chop.whitespace(str)
				if (ws) { tok.push(tmp) }
			}
		}

		tok.push(new TokEnd(str.getCoords()))

		return tok
	}

	Tokenizer.chop.strUnescape = function (s) {
		return s.replace(/\\\'/g, '\'')
			.replace(/\\\"/g, '\"')
			.replace(/\\\\/g, '\\')
			.replace(/\\\n/g, '\n')
	}

	Tokenizer.chop.strs = function (str) {
		const coords = str.getCoords()
		str.setMarker()
		str.adv()

		while (true) {
			if (str.cur() === '\\') {
				str.adv()
			} else if (str.cur() === "'") {
				str.adv()
				return new TokStr(Tokenizer.chop.strUnescape(str.getMarked().slice(1, -1)), coords)
			} else if (str.cur() === '\n' || !str.hasNext()) {
				throw 'String did not end well ' + str.getCoords()
			}

			str.adv()
		}
	}

	Tokenizer.chop.strd = function (str) {
		const coords = str.getCoords()
		str.setMarker()
		str.adv()

		while (true) {
			if (str.cur() === '\\') {
				str.adv()
			} else if (str.cur() === '"') {
				str.adv()
				return new TokStr(Tokenizer.chop.strUnescape(str.getMarked().slice(1, -1)), coords)
			} else if (str.cur() === '\n' || !str.hasNext()) {
				throw 'String did not end well ' + str.getCoords()
			}

			str.adv()
		}
	}

	Tokenizer.chop.num = function (str) {
		const coords = str.getCoords()
		str.setMarker()

		let tmp = str.cur()
		while (tmp >= '0' && tmp <= '9') {
			str.adv()
			tmp = str.cur()
		}

		if (str.cur() === '.') {
			str.adv()
			let tmp = str.cur()
			while (tmp >= '0' && tmp <= '9') {
				str.adv()
				tmp = str.cur()
			}
		}

		if (') \n\t'.indexOf(str.cur()) === -1) {
			throw "Unexpected character '" + str.cur() + "' after \"" + str.getMarked() + '" ' + str.getCoords()
		}

		return new TokNum(str.getMarked(), coords)
	}

	Tokenizer.chop.commml = function (str) {
		const coords = str.getCoords()
		str.setMarker()
		str.adv()
		str.adv()

		while (true) {
			if (str.cur() === '*' && str.next() === '/') {
				str.adv()
				str.adv()
				return new TokCommML(str.getMarked(), coords)
			} else if (str.hasNext()) {
				str.adv()
			} else {
				throw 'Multiline comment not properly terminated ' + str.getCoords()
			}
		}
	}

	Tokenizer.chop.commsl = function (str) {
		const coords = str.getCoords()
		str.setMarker()
		str.adv()
		str.adv(2)

		while (true) {
			if (str.cur() === '\n' || !str.hasNext()) {
				str.adv()
				return new TokCommSL(str.getMarked(), coords)
			} else {
				str.adv()
			}
		}
	}

	Tokenizer.chop.alphanum = function (str) {
		const coords = str.getCoords()
		str.setMarker()

		let tmp = str.cur()
		while (tmp > ' ' && tmp <= '~' && (tmp !== '(' && tmp !== ')')) {
			str.adv()
			tmp = str.cur()
		}

		tmp = str.getMarked()

		if (tmp === '#t' || tmp === '#f') {
			return new TokBool(tmp, coords)
		} else if (Tokenizer.chop.alphanum.reserved.has(tmp)) {
			return new TokKeyword(tmp, coords)
		} else {
			return new TokIdentifier(tmp, coords)
		}
	}

	Tokenizer.chop.alphanum.reserved = new Set([
		'unit',
		'pair', 'pair?', 'list', 'fst', 'snd',
		'record', 'record?', 'deref', 'contains?',
		'fun', 'lambda', 'call', 'closure?',
		'calljs', 'arrjs',
		'+', '-', '*', '/', '%',
		'>',
		'not', 'and', 'or', 'xor',
		'let', 'mut', 'let*', 'letrec', 'if', 'cond',
		'set!', 'setfst!', 'setsnd!',
		'num?', 'bool?', 'unit?', 'string?',
		'print', 'err',
		'module', 'public', 'private',
	])

	Tokenizer.chop.whitespace = function (str) {
		const tmp = str.cur()
		str.adv()
		return new TokWhitespace(tmp)
	}

	return Tokenizer
})()
