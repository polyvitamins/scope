var Promises = require('polypromise').Promises;
require('polyinherit');
var extend = require('extend');
var compareObjects = require('compareObjects');
var dataSnap = function(data) {
    var snap;
    if ("object"===typeof data && null!==data) {
        try {
            snap = JSON.stringify(data); // Lite JSON method to take smapshot
        } catch(e) {
            snap = extend(true, {}, data); // Heavy method for recrussive objects
        }
    } else if (null===data || undefined===data) {
        snap = data;
    } else {
        snap = data.toString()
    }

    return snap;
};

// Set global constants
POLYSCOPE_DEFAULT = 1 << 0;
POLYSCOPE_WATCH = 1 << 1;
POLYSCOPE_ONCE = 1 << 2;
POLYSCOPE_DEEP = 1 << 3;
POLYSCOPE_DITAILS = 1 << 4;
POLYSCOPE_COMPARE = 1 << 5;
POLYSCOPE_ARRAYRESULT = 1 << 10;


var Scope = function($$parent) {
	this.$$digestRequired = false;
    this.$$digestInProgress = false;
    this.$$watchers = [];
    this.$$digestInterationCount=0;

    /* Set parent scope */
    if ("object"===typeof $$parent) {
        this.$$$parentScope = $$parent;
        if ($$parent.$$childScopes instanceof Array) $$parent.$$childScopes.push(this);
    }
    /*
    Make self childs
    */
    if ("undefined"===typeof this.$$childScopes) this.$$childScopes = [];
}.proto({
    /*
    Watch an expression (function) or set of expressions (means array)

    Arguments:
    * expr - string or function
    * For example $watch('person.name', function() { })
    * Or $watch(function() { return person.name; }, function() { });

    * callback - function

    * bitoptions - special set of bit options. Use constants POLYSCOPE_WATCH, POLYSCOPE_DEEP, POLYSCOPE_INFO to specify options.
    * For example: $watch('person.name', function() { }, POLYSCOPE_WATCH | POLYSCOPE_DEEP)
    * If u use at last one of bitoption constants, be carefull, other options

    */
    $watch: function(expr, callback, bitoption) {
        return this[expr instanceof Array ? '$watchSet' : '$watchExpr'].apply(this, expr instanceof Array ? [expr, callback] : [expr, callback, "undefined"!==typeof bitoption ? bitoption : false]);
    },
    /*
    Get some value from current object by expression.
    Use special symbols at start of string to setup deep, watch and ditails options for each of expression.
    '+' - watch an expression
    '++' - deep watch an expression
    '?' - return full info for each expression result (value, diff, oldvalue)

    For example:
    ```
    $fetch('?++person', function(person) { }); // Watch person object with deep comparsion and full info
    $fetch('++person', function(person) { }); // Watch person object with deep comparsion
    $fetch('+person', function(person) { }); // Watch person object
    $fetch('person', function(person) { }); // Just get value of expression once
    ```

    Multiple expressions:
    ```
    $fetch(['+person', 'status.weight', '?++money'], function(person, weight, money) {

    });
    ```

    Using custom functions instead expression:
    $fetch(['+person', function() { return this.status.weight; }, '?++money'], function(...) { });

    If you wont to specify options to the function in single fetch, put to the 3th argument bitoptions.
    Just like that:

    ```
    $fetch(function() { return person }, callback, POLYSCOPE_WATCH | POLYSCOPE_DITAILS | POLYSCOPR_DEEP);
    ```

    Anyway, if you wanna to use custom functions array and also bitoptions
    you should replace each function to an array with simple structure:

    ```
    $fetch([
        [function() { ... }, POLYSCOPE_WATCH | POLYSCOPE_DITAILS | POLYSCOPR_DEEP]
    ], callback);
    ```
    */
    $fetch: function(expressions, callback, bitoptions) {
        var singleRequest=false;
        if (!(expressions instanceof Array)) {
            singleRequest = true;
            expressions = "string" === typeof expressions ? [expressions] : [expressions, bitoptions || (POLYSCOPE_ONCE)];
        }
        var self=this,
        watchable = expressions.map(function(val) {
            if ("string"===typeof val) {
                var map = 0,q;
                if (q = (/^[?+]?([+]{1,2})/).exec(val)) { 
                    map = map | POLYSCOPE_WATCH;
                    if (q[1].length>1) map = map | POLYSCOPE_DEEP;
                    if (q[1].length>2) map = map | POLYSCOPE_COMPARE;
                } else {
                    map = map | POLYSCOPE_ONCE;
                }
                if (/^[?+]?([?]{1})/.test(val))
                    map = map | POLYSCOPE_DITAILS;
                if (map===0) map = POLYSCOPE_DEFAULT;

                return [
                    val.replace(/^[+?]*/, ''),
                    map
                ];
            } else {
                return val;
            }
        });

        return this.$watchSet(watchable, function() {
            var results = singleRequest ? Array.prototype.slice.apply(arguments) : Array.prototype.slice.apply(arguments).map(function(val, index) {
                return watchable[index] instanceof Array ? (watchable[index][1] & POLYSCOPE_DITAILS ? val : val[0]) : val[0];
            });
            callback.apply(self, singleRequest ?
                    results[0]:
                results);
        }, POLYSCOPE_ARRAYRESULT);
    },
    /*
    Watch set
    $watchSet([expr1, expr2, expr3], function(val1, val2, val3) { })

    Option `fullinfo` make passible to get full info about result value. The result will be an array, where first key is new value, second value id diff.
    val1 = [value, diff];

    There is a way to specify watching mode while watching expression. To perform it value must be performed as array where first value is expression, and second is a number
    To specify options use next bitmap

    1 - watch
    2 - standart watching with plain comparing
    4 - deep compare

    for example, to set options !watch and deep and fullstack

    [function() { }, (2 | 4)]

    $watchSet(['start', 0], ['height', 1] , ['mystack', 2])
    
    */
    $watchSet: function(expressions, callback, advoption) {
        advoption = advoption || 0;
        var self = this, 
        snapshot = '';
        if (!(expressions instanceof Array)) {
            expressions = [expressions];
        }
        var unwatchers = Array(),
        unwacther = function() {
            for (var i = 0;i<unwatchers.length;++i) {
                unwatchers[i].destroy();
            }
        };
        new Promises(function(Promise) {
           for (var prop in expressions) {
            if (expressions.hasOwnProperty(prop)) {
                Promise(function(resolve, reject) {
                    var deep = false,
                    watch=false,
                    fullinfo=false,
                    unwatcher;
                    var bitoptions;
                    if (expressions[prop] instanceof Array) {
                        bitoptions = expressions[prop][1];

                    } else {
                        bitoptions = POLYSCOPE_WATCH;
                        fullinfo = false;
                    }
                    
                    unwatcher = self.$watchExpr(expressions[prop] instanceof Array ? expressions[prop][0] : expressions[prop], function(val) {

                        resolve.apply(self, (advoption & POLYSCOPE_ARRAYRESULT ? [Array.prototype.slice.apply(arguments)] : Array.prototype.slice.apply(arguments)));
                    }, bitoptions);
                    unwatchers.push(unwatcher);
                });
            }
           } 
        })
        .then(function() {
            var snap = dataSnap(Array.prototype.slice.apply(arguments));
            if (snap===snapshot) return; // Data not changed
            callback.apply(self, arguments);
        }, true)
        .catch(function() {
            var snap = dataSnap(Array.prototype.slice.apply(arguments));
            if (snap===snapshot) return; // Data not changed
            callback.apply(self, arguments);
        }, true);

        return unwacther;
    },
	/*
    Watch expression and return value to fn.
    Option `config` means that there will be an in-depth comparison.

    Furthermore, the option may include bit map, you can use next constants to set
    next options:
     POLYSCOPE_DEEP - deep comparison
     POLYSCOPE_ONCE - destroy watcher after first react
     POLYSCOPE_DITAILS - force full info

     Notice: if you dont wanna to watch expression and keep it alive use POLYSCOPE_ONCE
    */
    $watchExpr: function(expr, fn, config) {
        var deep,watch,fullinfo;
        if ("number"===typeof config) {
            deep = !!(config & POLYSCOPE_DEEP);
            watch = !(config & POLYSCOPE_ONCE);
            fullinfo = !!(config & POLYSCOPE_DITAILS);
            compare = !!(config & POLYSCOPE_COMPARE) || !!(config & POLYSCOPE_DITAILS);
        } else {
            deep = !!config;
            watch = true;
            fullinfo = false;
            compare = false;
        }

        var result = this.$parse(expr);
        
        if ("object"===typeof result)
    	var l = compare ? extend(true, {}, result) : result;
        else l = result;
        var watcher = {
            expr: expr,
            listner: fn || false,
            last: l,
            diff: l, // Last value of diff
            deep: !!deep, // Compare objects without diff
            compare: !!compare, // Deep analysis for objects diff
            once: !watch,
            fullinfo: fullinfo
        };

        this.$$watchers.push(watcher);
        var index = this.$$watchers.length-1, watchers=this.$$watchers;

        watcher.destroy = function() {
            watchers[index]=null;
        }

        // Callback now
        fn(l,l,l);
        if (watcher.once) watcher.destroy();

        return watcher;
    },
    $parse: function(expr) {
        var result;
        if ("function"===typeof expr) {
            result = expr.apply(this);
        } else if ("string"===typeof expr) {
            with(this) {
                try {
                    eval('result = '+expr+';');
                } catch(e) {
                    throw 'Error in expression: '+'result = '+expr+';';
                    result = new Error(e);
                }
            }
        } else {
            result = expr;
        }
        return result;
    },
    /*
    Вносит изменения в cache и запускает digest во всем дереве
    */
    $apply: function(exprFn) {
        exprFn.call(this);
        
        var parent = this;
        while("object"===typeof this.$$parent && "function"===typeof this.$$parent.$digest) {
        	parent = this.$$parent;
        }
        parent.$digest();
    },
    /* Выполняет выражение и запускает цикл */
    $eval: function(exprFn) {
        this.$parse(exprFn);
        this.$digest();
    },
    /*
    Получает суммарные данные объекта. Это значит что перед тем как
    вернуть объект он мержит все его ветки в одну. На выходе получается
    объект с самыми свежими правками.
    Можно специфицировать ветку для выдачи в параметре branch, тогда будет
    возвращен объект только с учетом изменений в указанной ветке.
    */
    $digest: function() {
        var self = this;

    	// Immersion to childs
    	if (this.$$childScopes instanceof Array) {
        	for (var i = 0;i<this.$$childScopes.length;++i) {
                this.$$childScopes[i].$digest();
        		if ("function"===typeof this.$$childScopes[i].$digest)
                    this.$$childScopes[i].$digest();
        	}
        }

        if (this.$$digestInProgress) { this.$$digestRequired = true; return }
        this.$$digestInProgress = true;

        this.$$watchers.forEach(function(watch) {
            if (watch===null) return;
            var newly = self.$parse(watch.expr),different=false;
            if ("object"===typeof newly && "object"===typeof watch.last) {
            	
                if (watch.deep) {
                    if (watch.compare) {
                        var diff = compareObjects(newly, watch.last);
                        if (diff.$$hashKey) delete diff.$$hashKey; // Удаляем hashKey angular
                        different=(JSON.stringify(diff) !== '{}');
                    } else {
                        different=(JSON.stringify(newly)!==JSON.stringify(watch.last));

                        if (different) diff = newly;
                        else diff = {};
                    }
                } else {
                    different= (newly!==watch.last);
                    diff = newly;
                }
            	
            } else if (typeof newly !== typeof watch.last) {

            	different = true;
            	diff = newly;
            } else {
                
            	if (newly!==watch.last) {
                    
            		different = true;
            		diff = newly;
            	} else {
                    
            		different = false;
            		diff = '';
            	}            	
            };
            
			watch.diff = diff;            
            if (different) {
             watch.listner(newly, diff, watch.last);
              if (watch.once) watch.destroy();
              watch.last = "object"===typeof newly ? (watch.compare ? extend(true, {}, newly) : newly) : newly;
            }
            
        });
        if (this.$$digestRequired) {
            this.$$digestInterationCount++;
            if (this.$digestInterationCount>5) {
                throw 'Digest max interation count';
            }
            this.$digest();
        } else {
            this.$$digestInterationCount=0;
            this.$$digestInProgress = false;
        }
    },
    $approve: function() {
        sx.utils.eachArray(this.$$watchers, function(watch) {
            if (watch===null) return;
            var newly = this.$parse(watch.expr);
            var diff = sx.utils.compareObjects(newly, watch.last);
            if (diff.$$hashKey) delete diff.$$hashKey; // Удаляем hashKey angular
            if (JSON.stringify(diff) !== '{}') {
                watch.last = extend(true, {}, newly);
            }
        });
    }
});

module.exports = Scope;
