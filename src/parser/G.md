```

start ->
( module name def_list )

def_list -> [ ( public | private name exp ) ]

exp -> 
  id
| bool
| num
| str
| ( special )

special ->
  if exp exp exp
| if* ( if_list ) exp
| fun name name exp
| fun* name ( name_list ) exp
| call exp exp
| call* exp ( param_list )
| let name exp exp
| let* ( let_list ) exp
| letrec ( letrec_list ) exp
| pair exp exp
| pair? exp
| list list_list
| record record_pairs
| record? exp
| contains? exp contains_list
| deref exp name
| num? exp
| and exp exp
| or exp exp
| xor exp exp
| + exp exp
| - exp exp
|exp exp
| > exp exp

if_list -> [ ( exp exp ) ]
name_list -> [ name ]
param_list -> [ exp ]
let_list -> [ ( name exp ) ]
letrec_list -> [ ( name exp ) ]
list_list -> [ exp ]
record_pairs -> [ ( name exp ) ]
contains_list -> name [ name ]

```