MUPLEx
======

MUPLEx is a Scheme like language, a superset of MUPL. The original MUPL specification was provided by Dan Grossman.
In addition to MUPL, MUPLEx supports records, mutability, letrec, booleans, branching and implicit currying.

[Try it out](http://htmlpreview.github.com/?https://github.com/madflame991/muplex/blob/working/main.html)

Examples:

1. The map function

```clojure
(call* 

 (fun* map (l op)
  (if (unit? l) 
      unit
      (pair (call op (fst l))
            (call* map (snd l) op))))
           
 (list 1 7 8 4) (fun sq x (* x x)))
 ```


Notice that function calls are done with the explicit *call* construct. 
This was intially considered because it greatly simplified the parser and later because 
it's very good as syntactic salt for preventing the common "I lost 15 minutes on a bug caused by a pair of rogue parantheses" 
 

Planned features:
-----------------

* rename if\* to cond
* rewrite let to behave more like the traditional let
* merge fun with fun\*
* allow functions with no parameters
* merge call with call\*
* add anonymous functions
* add namespaces or some equivalent construct
* add +, *, ... for more than 2 operands