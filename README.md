MUPLex
======

MUPLex is a Scheme-like language, a superset of MUPL. The original MUPL specification was provided by Dan Grossman.
In addition to MUPL, MUPLex supports records, mutability, letrec, booleans, branching and implicit currying.
As of version 0.5.1 MUPLex programs can be either interpreted or translated into JavaScript via the experimental *toJS* translator.

### Try it out: [Interpreter](http://adrianton3.github.io/muplex/demo/main-parse) | [to JS](http://adrianton3.github.io/muplex/demo/main-tojs) | [to LL](http://adrianton3.github.io/muplex/demo/main-toll)

**Examples:**

1. The map function

```scheme
(call

 (fun map (l op)
  (if (unit? l)
      unit
      (pair (call op (fst l))
            (call map (snd l) op))))

 (list 1 7 8 4) (lambda (x) (* x x)))
```

2. Closures

```scheme
(let
 ((f (lambda (x y) (+ x y)))
  (add10 (call f 10)))
 (call add10 3))
```

3. Mutation

```scheme
(mut a 10
 (let ((f (lambda (x) (+ x a))))
  (set! a 3
   (call f 11))))
```

Notice that function calls are done with the explicit `call` construct.
This was intially considered because it greatly simplified the parser and later because
it's very good as syntactic salt for preventing the common "I lost 15 minutes on a bug caused by a pair of rogue parantheses"


### The type system
MUPLex is dynamically typed. Before doing any operation, the evaluator first checks that the arguments
are of the correct type and throws a runtime error if they are not.

In addition to this, there is some type checking that is performed at "compile time", before launching the program.
This is done in order to filter out programs that would otherwise fail at runtime (but only if that code is reached).
Of course, this system cannot prevent every faulty program from being launched.

**Examples of errors caught before launch:**

```scheme
(+ 10 #f)
(+ (fst (pair unit 30)) 40)
(call #t 20)
(snd (record (a 1) (b 2)))
```

Moreover, before launch, the program is checked to see if it contains references to undeclared variables.

Usage:
------

This is the simplest way of evaluating an expression:

```js
function ev(code) { return RDP.single(Tokenizer.chop(code)).ev(Env.Emp, ModuleSet.getEmp()); }
var result = ev('(let a 10 (+ a 15))');
```

If, however, you require function definitions from a module, then use this:

```js
function ev(expCode, modSetCode) {
 var modSet = RDP.tree(Tokenizer.chop(modSetCode));
 return RDP.single(Tokenizer.chop(code)).ev(Env.Emp, modSet);
}

modSetCode = '(module m (public f (lambda (x) (* x x))))';
expCode = '(let a 10 (+ a (call m.f 5)))';

var result = ev(expCode, modSetCode);
```

Use the following snippet if you want to do some basic type checking, to check for references to
undeclared module definitions or variables and invalid names, etc:

```js
try {
 parsedExp.accept(new StaticCheck(), new VarCheckState(Env.Emp, modSet));
} catch(e) {
 alert(e);
}
```

Module sets can also accept type/reference checkers:

```js
try {
 modSet.accept(new StaticCheck(), new VarCheckState(Env.Emp, modSet));
} catch(e) {
 alert(e);
}
```

Planned features:
-----------------

* add `+`, `*`, ... for more than 2 operands
* add code formatting
* add `sametype?`
* add `=` for numbers and `deepEq?` for pairs and records
* add basic operations for strings: `charAt`, `concat`, `charCode`, `fromCharCode`
* add mpair
* rename `deref` to `dot` or something more appropriate
* do extensive testing on the translator
* prettify *index.html*
* add documentation
* add type checking for function parameters
* separate the current parser into a generic S-expression parser, a syntax validator and an expression expander
* use github pages instead of old live preview

Version history:
----------------

### r18

* replace the tokenizer and parser with espace

### r17

* experimental translation to a low level language (*toLL*)
* basic styling
* separate pages for each "module"
* upgraded textareas to codemirror

### r16

* added better type-checking

### r15

* added more tests for *toJS*

### r14

* *toJS* translator now supports modules
* added necessary helper functions for *toJS*
* lexer and parser output can be turned on or off
* improved error messages
* cleaned up *RDP.js*
* fixed a `contains?` not parsing properly

### r13

* added experimental *toJS* translator

### r12

* added line numbers in error messages
* updated *Usage* examples
* renamed *TypeCheck.js* to *StaticCheck.js*

### r11

* unified *TypeCheck.js* and *VarCheck.js*
* expressions keep their type when they're bound
* `let` now defines immutable bindings
* added `mut` for declaring mutable bindings
* added more static checking
* improved some error messages
* fixed a bug in *index-pretty.html*

### r10

* added strings
* added "exceptions" via `err`
* cleaned up *List.js*

### r9

* removed `_M` from global scope
* added a *Usage* section to this document

### r8

* added modules with public and private definitions
* updated reference checking to work with modules
* fixed bugs in *main.html*

### r7

* added a simple syntax highlighter and export to HTML option
* added `closure?`

### r6

* added "compile time" checking for variables' definition

### r5

* added "compile time" basic type checking

### r4

* added a quick and dirty way to print stuff

### r3

* added `/`, `%`, `not`

### r2

* added anonymous functions
* added no-parameter functions
* removed old `fun` and `call`
* renamed `if*` to `cond`

### r1

* basic scheme-like language
