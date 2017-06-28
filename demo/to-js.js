(() => {
	'use strict'

	const { buildAst, buildProgramAst } = require('../../src/ast/AstBuilder.js').AstBuilder
	const StaticCheck = require('./interpreter/StaticCheck.js').StaticCheck
	const VarCheckState = require('./interpreter/VarCheckState.js').VarCheckState
	const Env = require('./interpreter/Env.js').Env
	const Out = require('./interpreter/Out.js').Out
	const ToJS = require('./interpreter/ToJS.js').ToJS

	let _parsedFreeExp
	let _modSet

	let inExpEditor, inModsEditor, outJSEditor

	function setupEditors () {
		inModsEditor = CodeMirror.fromTextArea(document.getElementById('in_mods'), {
			lineNumbers: true,
			styleActiveLine: true,
			matchBrackets: true,
		})
		inModsEditor.setSize(500, 300)
		inModsEditor.setOption('theme', 'cobalt')
		inModsEditor.on('change', process)

		inExpEditor = CodeMirror.fromTextArea(document.getElementById('in_exp'), {
			lineNumbers: true,
			styleActiveLine: true,
			matchBrackets: true,
		})
		inExpEditor.setSize(500, 200)
		inExpEditor.setOption('theme', 'cobalt')
		inExpEditor.on('change', process)

		outJSEditor = CodeMirror.fromTextArea(document.getElementById('out_js'), {
			lineNumbers: true,
			styleActiveLine: true,
			readOnly: true,
		})
		outJSEditor.setSize(500, 300)
		outJSEditor.setOption('theme', 'cobalt')
	}

	function setupUI () {
		document.getElementById('chk_headjs')
			.addEventListener('change', doTranslate)

		document.getElementById('chk_modjs')
			.addEventListener('change', doTranslate)
	}

	function parse (source) {
		const tokens = espace.Tokenizer()(source)
		return espace.Parser.parse(tokens)
	}

	function process () {
		const modsIn = inModsEditor.getValue()
		const expIn = inExpEditor.getValue()
		let outParser = ''

		try {
			_modSet = buildProgramAst(parse(modsIn))

			_modSet.accept(new StaticCheck(), new VarCheckState(Env.Emp, _modSet))
			outParser += 'Modules type/reference check: OK.\n'

			_parsedFreeExp = buildAst(parse(expIn))

			_parsedFreeExp.accept(new StaticCheck(), new VarCheckState(Env.Emp, _modSet))
			outParser += 'Free exp type/reference check: OK.\n'

			doTranslate()
		} catch (err) {
			// include outParser
			outJSEditor.setValue('Parsing failed ==> nothing to translate\nCheck "parser output"' + '\n' + err)
		}
	}

	function doTranslate () {
		const hHeadJS = document.getElementById('chk_headjs')
		const hModJS = document.getElementById('chk_modjs')

		let js = ''
		try {
			if (hHeadJS.checked) js += ToJS.header() + '\n\n'
			if (hModJS.checked) js += _modSet.accept(new ToJS())
			js += _parsedFreeExp.accept(new ToJS())
		}	catch (err) {
			js += '\n\nTranslation exception: ' + err
		}

		outJSEditor.setValue(js)
	}

	setupEditors()
	setupUI()

	process()
})()
