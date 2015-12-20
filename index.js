var extend = require('extend');
var compareObjects = require('compareObjects');
var Watcher = function() {
	this.$$digestRequired = false;
    this.$$digestInProgress = false;
    this.$$watchers = [];
    this.$$digestInterationCount=0;
}.proto({
	/*
    Функция проверяет отличия в объекте. Производит глубокий анализ.
    */
    $watch: function(expr, fn) {
    	var l = extend(true, {}, expr(this));
        var watcher = {
            expr: expr,
            listner: fn || false,
            last: l,
            diff: l
        };

        this.$$watchers.push(watcher);
        var index = this.$$watchers.length-1, watchers=this.$$watchers;

        watcher.destroy = function() {
            watchers[index]=null;
        }

        return watcher;
    },
    /*
    Вносит изменения в cache и запускает digest в данном scope и в дочерних
    */
    $apply: function(exprFn) {
        exprFn.call(this);
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
        if (this.$$digestInProgress) { this.$$digestRequired = true; return }
        this.$$digestInProgress = true;
        
        sx.utils.eachArray(this.$$watchers, function(watch) {
            if (watch===null) return;
            var newly = watch.expr(this);
            var diff = compareObjects(newly, watch.last);
            if (diff.$$hashKey) delete diff.$$hashKey; // Удаляем hashKey angular
			watch.diff = diff;            
            if (JSON.stringify(diff) !== '{}') {
             watch.listner(newly, watch.last, diff);
              watch.last = extend(true, {}, newly);
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
