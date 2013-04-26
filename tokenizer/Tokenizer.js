function Tokenizer() {

}

Tokenizer.chop = function(s, ws, comm) {
	if(ws == undefined) ws = false;
	if(comm == undefined) comm = false;
	
	var str = new IterableString(s + ' ');
	var tok = [];

	while(str.hasNext()) {
		var c = str.cur();
		
		if(c == "'") {
			tok.push(Tokenizer.chop.strs(str)); 
		}
		else if(c == '"') { 
			tok.push(Tokenizer.chop.strd(str)); 
		}
		else if(c == '/') {
			var n = str.next();
			if(n == '/') {
				var tmp = Tokenizer.chop.commsl(str);
				if(comm) tok.push(tmp);
			}
			else if(n == '*') {
				var tmp = Tokenizer.chop.commml(str);
				if(comm) tok.push(tmp);
			}
			else {
				tok.push(Tokenizer.chop.alphanum(str));
			}
		}
		else if(c >= '0' && c <= '9') { 
			tok.push(Tokenizer.chop.num(str)); 
		}
		else if(c == '(') { 
			tok.push(new TokLPar());
			str.adv();
		}
		else if(c == ')') {
			tok.push(new TokRPar());
			str.adv();
		}
		else if(c > ' ' && c <= '~') { 
			tok.push(Tokenizer.chop.alphanum(str)); 
		}
		else {
			var tmp = Tokenizer.chop.whitespace(str);
			if(ws) tok.push(tmp); 
		}
	}
	
	tok.push(new TokEnd());
	
	return tok;
}

Tokenizer.chop.strUnescape = function(s) {
	return s.replace(/\\\'/g, '\'')
					.replace(/\\\"/g, '\"')
					.replace(/\\\\/g, '\\')
					.replace(/\\\n/g, '\n');
}

Tokenizer.chop.strs = function(str) {
	str.setMarker();
	str.adv();
	
	while(true) {
		if(str.cur() == '\\') str.adv();
		else if(str.cur() == "'") { str.adv(); return new TokStr(Tokenizer.chop.strUnescape(str.getMarked().slice(1, -1))); }
		else if(str.cur() == '\n' || !str.hasNext()) throw "String did not end well";
		str.adv();
	}
}

Tokenizer.chop.strd = function(str) {
	str.setMarker();
	str.adv();
	
	while(true) {
		if(str.cur() == '\\') str.adv();
		else if(str.cur() == '"') { str.adv(); return new TokStr(Tokenizer.chop.strUnescape(str.getMarked().slice(1, -1))); }
		else if(str.cur() == '\n' || !str.hasNext()) throw "String did not end well";
		str.adv();
	}
}

Tokenizer.chop.num = function(str) {
	str.setMarker();

	var tmp = str.cur();
	while(tmp >= '0' && tmp <= '9') {
		str.adv();
		tmp = str.cur();
	}
	
	if(str.cur() == '.') {
		str.adv();
		var tmp = str.cur();
		while(tmp >= '0' && tmp <= '9') {
			str.adv();
			tmp = str.cur();
		}
	}
	
	if(') \n\t'.indexOf(str.cur()) == -1) throw "Unexpected character '" + str.cur() + "' after \"" + str.getMarked() + '"';
	
	return new TokNum(str.getMarked());
}

Tokenizer.chop.commml = function(str) {
	str.setMarker(); 
	str.adv();
	str.adv();
	
	while(true) { 
		if(str.cur() == '*' && str.next() == '/') { 
			str.adv();
			str.adv();
			return new TokCommML(str.getMarked()); 
		}
		else if(str.hasNext()) {
			str.adv();
		}
		else throw 'Multiline comment not properly terminated';
	}
}

Tokenizer.chop.commsl = function(str) {
	str.setMarker(); 
	str.adv();
	str.adv(2);
	
	while(true) {
		if(str.cur() == '\n' || !str.hasNext()) { 
			str.adv();
			return new TokCommSL(str.getMarked()); 
		}
		else str.adv();
	}
}

Tokenizer.chop.alphanum = function(str) {
	str.setMarker();

	var tmp = str.cur();
	while(tmp > ' ' && tmp <= '~' && (tmp != '(' && tmp != ')')) {
		str.adv();
		tmp = str.cur();
	}
	
	tmp = str.getMarked();
	
	if(tmp == '#t' || tmp == '#f') return new TokBool(tmp);
	if(Tokenizer.chop.alphanum.reserved.indexOf(tmp) != -1) return new TokKeyword(tmp);
	else return new TokIdentifier(tmp);
}

Tokenizer.chop.alphanum.reserved = [
	'unit',
	'pair', 'pair?', 'list', 'fst', 'snd',
	'record', 'record?', 'deref', 'contains?',
	'fun', 'lambda', 'call', 'closure?',
	'+', '-', '*', '/', '%',
	/*'<', '<=', '=', '>='*/, '>',
	'not', 'and', 'or', 'xor',
	'let', 'let*', 'letrec', 'if', 'cond',
	'set!', 'setfst!', 'setsnd!',
	'num?', 'bool?', 'unit?',
	'print'];

Tokenizer.chop.whitespace = function(str) {
	var tmp = str.cur();
	str.adv(); 
	return new TokWhitespace(tmp);
}