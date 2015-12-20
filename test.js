var tap = require('tap');
var Scope = require('./index.js');
var tester;
var collection = {
	"a": {"hello": "world"},
	"b": 123,
	"c": null
};
tap.test('just cross test', function(t) {
	t.ok("function"===typeof Scope, "Scope must be a function");
	tester = new Scope();
	// Test methods
	
	t.ok(typeof tester.$watch==="function", "Scope must have method $watch");
	t.ok(typeof tester.$apply==="function", "Scope must have method $apply");
	t.ok(typeof tester.$digest==="function", "Scope must have method $digest");
	t.ok(typeof tester.$approve==="function", "Scope must have method $approve");
	// Test properties
	t.ok("boolean" ===typeof tester.$$digestRequired, "Scope must have property $$digestRequired");
	t.ok("boolean" ===typeof tester.$$digestInProgress, "Scope must have property $$digestInProgress");
	t.ok("object" ===typeof tester.$$watchers, "Scope must have property $$watchers");
	t.ok("number" ===typeof tester.$$digestInterationCount, "Scope must have property $$digestInterationCount type number "+(typeof tester.$$digestInterationCount)+" given");
	
	t.end();
});

tap.test('watcher in plain mode', function planned(t) {
	t.plan(2);

	var expect = collection, count=0;
	var watcher = tester.$watch(function() {
		return collection;
	}, function(result, diff) {
		count++;
		t.ok(true);
		
	});

	setTimeout(function() {
		// Change c to true
		tester.$eval(function() {
			expect = {c: true};
			collection.c = true;
		});
	}, 20);
});

tap.test('watcher in deep mode', function planned(t) {
	t.plan(2);
	var collection2 = {
		"a": {"hello": "world"},
		"b": 123,
		"c": null
	};
	var expect = collection2, count=0;
	var watcher = tester.$watch(function() {
		return collection2;
	}, function(result, diff) {
		count++;
		console.log('watching', count);
		t.ok(JSON.stringify(diff)==JSON.stringify(expect), "["+count+"] Unexpected diff result. Expect "+JSON.stringify(expect)+", but "+JSON.stringify(diff)+" given;");
		
	}, true);

	setTimeout(function() {
		// Change c to true
		tester.$eval(function() {
			console.log('eval!!!');
			expect = {c: true};
			collection2.c = true;
		});
	}, 40);
});

tap.test('test degist immersion', function planned(t) {
    t.plan(2);
setTimeout(function() {

		var subtester = new Scope(tester), iterations = 0,testCollection={};
		subtester.$watch(function() {
				return testCollection.someInteger;
			}, function(bulba) {
			iterations++;
			if (iterations===1) {
				t.ok(bulba===undefined, "Undefined expression result must be undifined, "+("object"===typeof bulba ? JSON.stringify(bulba) : bulba)+"given");
			}
			if (iterations===2) {
				t.ok(bulba===123, "Result at iteration #2 must be number, "+bulba+"given")
			}
		});

	    tester.$eval(function() {
	        testCollection.someInteger = 123;
	    });

    }, 50);
});