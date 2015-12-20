var tap = require('tap');
var Watcher = require('./index.js');
var tester;
tap.test('just cross test', function(t) {
	t.ok("function"===typeof Watcher, "Watcher must be a function");
	tester = new Watcher();
	// Test methods
	console.log('t', t);
	t.ok(typeof tester.$watch==="function", "Watcher must have method $watch");
	t.ok(typeof tester.$apply==="function", "Watcher must have method $apply");
	t.ok(typeof tester.$digest==="function", "Watcher must have method $digest");
	t.ok(typeof tester.$approve==="function", "Watcher must have method $approve");
	// Test properties
	t.ok("boolean" ===typeof tester.$$digestRequired, "Watcher must have property $$digestRequired");
	t.ok("boolean" ===typeof tester.$$digestInProgress, "Watcher must have property $$digestInProgress");
	t.ok("object" ===typeof tester.$$watchers, "Watcher must have property $$watchers");
	t.ok("boolean" ===typeof tester.$$digestInterationCount, "Watcher must have property $$digestInterationCount");
	// Watch 
	var collection = {
		"a": {"hello": "world"},
		"b": 123,
		"c": null
	};
	var watcher = tester.$watch(function() {
		return collection;
	}, function(result, diff) {
		t.equal(collection, result, "Watch result and collection must be equals");
	});

	t.end();
});