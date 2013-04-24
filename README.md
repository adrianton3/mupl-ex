MUPLEx
======

MUPLEx is a Scheme like language, a superset of MUPL. The original MUPL specification was provided by Dan Grossman.
In addition to MUPL, MUPLEx supports records, mutability, letrec, booleans, branching and implicit currying.

[Try it out](http://htmlpreview.github.com/?https://github.com/madflame991/muplex/blob/working/main.html)  
\*the live demo will not work in Chrome/Safari

**Examples:**

1. The map function

 ```clojure
(call 

 (fun map (l op)
  (if (unit? l) 
      unit
      (pair (call op (fst l))
            (call map (snd l) op))))
           
 (list 1 7 8 4) (lambda (x) (* x x)))
```

2. Closures

 ```clojure
(let* 
 ((f (lambda (x y) (+ x y)))
  (add10 (call f 10)))
 (call add10 3))
```

3. Mutation

 ```clojure
(let a 10
 (let f (lambda (x) (+ x a))
  (set! a 3
   (call f 11))))
```

Notice that function calls are done with the explicit *call* construct. 
This was intially considered because it greatly simplified the parser and later because 
it's very good as syntactic salt for preventing the common "I lost 15 minutes on a bug caused by a pair of rogue parantheses" 


###The type system
MUPLEx is dynamically typed. Before doing any operation, the evaluator first checks that the arguments 
are of the correct type and throws a runtime error if they are not.

In addition to this, there is some type checking that is performed at "compile time", before launching the program. 
This is done in order to filter out programs that would otherwise fail at runtime (but only if that code is reached). 
Of course, this system cannot prevent every faulty program from being launched.

**Examples of errors caught before launch:**

```clojure
(+ 10 #f)
(+ (fst (pair unit 30)) 40)
(call #t 20)
(snd (record (a 1) (b 2)))
```

Planned features:
-----------------

* add strings
* add namespaces or some equivalent construct
* add +, \*, ... for more than 2 operands
* add code formatting
* add exceptions
* remove/change currying by default

Version history:
----------------

### 0.3.1

* added "compile time" checking for variables' definition

### 0.3

* added "compile time" basic type checking

### 0.2.2

* added a quick and dirty way to print stuff

### 0.2.1

* added /, %, not

### 0.2

* added anonymous functions
* added no-parameter functions
* removed old *fun* and *call*
* renamed *if\** to *cond*

### 0.1

* basic scheme-like language