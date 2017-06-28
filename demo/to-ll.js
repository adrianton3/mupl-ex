(() => {
	'use strict'

	const { buildAst } = require('../../src/ast/AstBuilder.js').AstBuilder
	var StaticCheck = require('./interpreter/StaticCheck.js').StaticCheck;
	var VarCheckState = require('./interpreter/VarCheckState.js').VarCheckState;
	var Env = require('./interpreter/Env.js').Env;
	var ToLL = require('./interpreter/ToLL.js').ToLL;
	var LLI = require('./interpreter/LLI.js').LLI;

	var _parsedFreeExp;

	var inExpEditor, outLLEditor, outInterpreterEditor;

	function setupEditors() {
		inExpEditor = CodeMirror.fromTextArea(document.getElementById('in_exp'), {
			lineNumbers: true,
			styleActiveLine: true,
			matchBrackets: true
		});
		inExpEditor.setSize(500, 300);
		inExpEditor.setOption('theme', 'cobalt');
		inExpEditor.on('change', process);

		outLLEditor = CodeMirror.fromTextArea(document.getElementById('out_ll'), {
			lineNumbers: true,
			styleActiveLine: true,
			readOnly: true
		});
		outLLEditor.setSize(500, 300);
		outLLEditor.setOption('theme', 'cobalt');

		outInterpreterEditor = CodeMirror.fromTextArea(document.getElementById('out_interpreter'), {
			lineNumbers: true,
			styleActiveLine: true,
			readOnly: true
		});
		outInterpreterEditor.setSize(500, 100);
		outInterpreterEditor.setOption('theme', 'cobalt');
	}

	function setupUI() {
		document.getElementById('but_compute_ll')
			.addEventListener('click', doEvalLL);
	}

	function parse (source) {
		const tokens = espace.Tokenizer()(source)
		return espace.Parser.parse(tokens)
	}

	function process() {
		var expIn = inExpEditor.getValue();
		var outParser = '';

		try {
			_parsedFreeExp = buildAst(parse(expIn))

			var freeExpt = _parsedFreeExp.accept(new StaticCheck(), new VarCheckState(Env.Emp, null));
			outParser += 'Free exp type/reference check: OK.\n';

			doCompile();
		} catch(err) {
			// include outParser
			outLLEditor.setValue('Parsing failed ==> nothing to translate\nCheck "parser output"' + '\n' + err);
		}
	}

	function doCompile() {
		var ll = '';
		try {
			ll += _parsedFreeExp.accept(new ToLL());
		}	catch(err) {
			ll += '\n\nTranslation exception: ' + err;
		}

		outLLEditor.setValue(ll);
	}

	function doEvalLL() {
		var source = outLLEditor.getValue();
		var result = new LLI().interpret(source);

		outInterpreterEditor.setValue(result.toString());
	}

	setupEditors()
	setupUI()

	process()
})()