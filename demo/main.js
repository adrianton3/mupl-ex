(() => {
	'use strict'

	const { buildAst, buildProgramAst } = require('../../src/ast/AstBuilder.js').AstBuilder
	var StaticCheck = require('./interpreter/StaticCheck.js').StaticCheck;
	var VarCheckState = require('./interpreter/VarCheckState.js').VarCheckState;
	var Env = require('./interpreter/Env.js').Env;
	var Out = require('./interpreter/Out.js').Out;

	var _parsedFreeExp;
	var _modSet;

	var inModsEditor, inExpEditor, outParserEditor, outInterpreterEditor;

	function setupEditors() {
		inModsEditor = CodeMirror.fromTextArea(document.getElementById('in_mods'), {
			lineNumbers: true,
			styleActiveLine: true,
			matchBrackets: true
		});
		inModsEditor.setSize(500, 200);
		inModsEditor.setOption('theme', 'cobalt');
		inModsEditor.on('change', process);

		inExpEditor = CodeMirror.fromTextArea(document.getElementById('in_exp'), {
			lineNumbers: true,
			styleActiveLine: true,
			matchBrackets: true
		});
		inExpEditor.setSize(500, 100);
		inExpEditor.setOption('theme', 'cobalt');
		inExpEditor.on('change', process);

		outParserEditor = CodeMirror.fromTextArea(document.getElementById('out_parser'), {
			lineNumbers: true,
			styleActiveLine: true,
			readOnly: true
		});
		outParserEditor.setSize(500, 300);
		outParserEditor.setOption('theme', 'cobalt');

		outInterpreterEditor = CodeMirror.fromTextArea(document.getElementById('out_interpreter'), {
			lineNumbers: true,
			styleActiveLine: true,
			readOnly: true
		});
		outInterpreterEditor.setSize(500, 100);
		outInterpreterEditor.setOption('theme', 'cobalt');
	}

	function setupUI() {
		document.getElementById('chk_ast')
			.addEventListener('change', process);

		document.getElementById('but_compute')
			.addEventListener('click', doEval);
	}

	function parse (source) {
		const tokens = espace.Tokenizer()(source)
		return espace.Parser.parse(tokens)
	}

	function process() {
		var hComputeButton = document.getElementById('but_compute');

		var hAst = document.getElementById('chk_ast');

		var modsIn = inModsEditor.getValue();
		var expIn = inExpEditor.getValue();
		var outParser = '';

		try {
			_modSet = buildProgramAst(parse(modsIn))

			_modSet.accept(new StaticCheck(), new VarCheckState(Env.Emp, _modSet));
			outParser += 'Modules type/reference check: OK.\n';

			_parsedFreeExp = buildAst(parse(expIn))
			if (hAst.checked) {
				outParser += 'Free exp AST:\n----\n' + _parsedFreeExp.toString() + '\n\n';
			}

			_parsedFreeExp.accept(new StaticCheck(), new VarCheckState(Env.Emp, _modSet));
			outParser += 'Free exp type/reference check: OK.\n';

			hComputeButton.disabled = false;
		} catch(err) {
			outParser += err;
			hComputeButton.disabled = true;
		}
		outParserEditor.setValue(outParser);
	}

	function doEval() {
		var istr = '';
		try {
			Out.reset();
			var res = _parsedFreeExp.ev(Env.Emp, _modSet);
			istr += res.toString();

			istr += '\n---\n\n';
			istr += Out.toString();
		} catch(err) {
			istr += 'Runtime exception: ' + err;
		}

		outInterpreterEditor.setValue(istr);
	}

	setupEditors()
	setupUI()

	process()
})()