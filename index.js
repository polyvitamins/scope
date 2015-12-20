require('polyinherit');
var extend = require('extend');
var compareObjects = require('compareObjects');
var Scope = function() {
	this.$$digestRequired = false;
    this.$$digestInProgress = false;
    this.$$watchers = [];
    this.$$digestInterationCount=0;
}.proto({
	/*
    Функция проверяет отличия в объекте. Производит глубокий анализ.
    */
    $watch: function(expr, fn, deep) {
    	var l = extend(true, {}, expr(this));
        var watcher = {
            expr: expr,
            listner: fn || false,
            last: l,
            diff: l,
            deep: !!deep
        };

        this.$$watchers.push(watcher);
        var index = this.$$watchers.length-1, watchers=this.$$watchers;

        watcher.destroy = function() {
            watchers[index]=null;
        }

        return watcher;
    },
    /*
    Вносит изменения в cache и запускает digest во всем дереве
    */
    $apply: function(exprFn) {
        exprFn.call(this);
        
        var parent = this;
        while("object"===typeof this.$parent && "function"===typeof this.$parent.$digest) {
        	parent = this.$parent;
        }
        parent.$digest();
    },
    /*
    Получает суммарные данные объекта. Это значит что перед тем как
    вернуть объект он мержит все его ветки в одну. На выходе получается
    объект с самыми свежими правками.
    Можно специфицировать ветку для выдачи в параметре branch, тогда будет
    возвращен объект только с учетом изменений в указанной ветке.
    */
    $digest: function() {
    	// Immersion to childs
    	if (this.$childs instanceof Array) {
        	for (var i = 0;i<this.$childs.length;++i) {
        		if ("function"===typeof this.$childs.$digest) this.$childs.$digest();
        	}
        }

        if (this.$$digestInProgress) { this.$$digestRequired = true; return }
        this.$$digestInProgress = true;
        
        sx.utils.eachArray(this.$$watchers, function(watch) {
            if (watch===null) return;
            var newly = watch.expr(this),different=false;
            if (watch.deep && ("object"===typeof newly && "object"===typeof watch.last)) {
            	
        		var diff = compareObjects(newly, watch.last);
            	if (diff.$$hashKey) delete diff.$$hashKey; // Удаляем hashKey angular
            	different=(JSON.stringify(diff) !== '{}');
            	
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
             watch.listner(newly, watch.last, diff);
              watch.last = "object"===typeof newly ? extend(true, {}, newly) : newly;
            }
            
        }, this);
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
            var newly = watch.expr(this);
            var diff = sx.utils.compareObjects(newly, watch.last);
            if (diff.$$hashKey) delete diff.$$hashKey; // Удаляем hashKey angular
            if (JSON.stringify(diff) !== '{}') {
                watch.last = extend(true, {}, newly);
            }
        });
    }
});

return Scope;
