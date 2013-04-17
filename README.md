<<<<<<< HEAD
MUPLEx
======

MUPLEx is a Scheme like language, a superset of MUPL. The original MUPL specification was provided by Dan Grossman.
In addition to MUPL, MUPLEx supports records, mutability, letrec, booleans, branching and implicit currying.

[Try it out](http://htmlpreview.github.com/?https://github.com/madflame991/muplex/blob/working/main.html)  
\*will not work in Chrome/Safari

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
 

Planned features:
-----------------

* add namespaces or some equivalent construct
* add +, *, ... for more than 2 operands
* add "compile-time" basic type checking for primitive operations
* add print

Version history:
----------------

### 0.2.1

* added /, %, not

### 0.2

* added anonymous functions
* added no-parameter functions
* removed old *fun* and *call*
* renamed *if\** to *cond*

### 0.1

* basic scheme-like language
=======
muplex
======
>>>>>>> remotes/gh/master
