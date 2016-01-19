var tap = require('tap');
var Scope = require('./../index.js');
var tester;
 tester = new Scope();

tap.test('shared string', function planned(t) {
    t.plan(1);

    tester.some = {
    	deep: {
    		data: {
    			hello: 'world'
    		}
    	}
    }

    tester.$watch('some.deep.data', ['?++hello'], function(hello) {
		t.ok(hello[0] == 'world', "Shared hello should works");
    });
});

tap.test('customize watcher', function planned(t) {
    t.plan(1);

    tester.some = {
        deep: {
            data: {
                hello: 'world'
            }
        }
    }

    var scope = {
        alfa: 'omega'
    }

    tester.$polyscope.customization.watchExprRouters.push({
        match: /^scope\./,
        replace: /^(scope\.)/,
        overrideMethod: function(expr, callback, flags) {
            var result;
            with (scope) {
                try {
                    eval('result=' + expr + ';');
                } catch(e) {
                    console.log('result=' + expr + ';');
                    throw e;
                }
            }
            callback(result);

            return {
                destroy: function() {
                    console.log('WHY DESTROY??');
                }
            }
        }
    });

    tester.$watch('scope', ['alfa'], function(alfa) {
        t.ok(alfa == 'omega', "Custom wacther should works");
    });
});