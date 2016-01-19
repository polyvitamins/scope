var tap = require('tap');
var Scope = require('./../index.js');
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
    t.plan(1);
    var count = 0;
    var expect = collection, count=0;
    var watcher = tester.$watch([function() {
        return collection;
    }, POLYSCOPE_DEEP], function(result, diff) {
        count++;

        if (count===2)
            t.ok(true, "Value must de returned by digest");

    });

    setTimeout(function() {
        // Change c to true
        tester.$eval(function() {
            expect = {c: true};
            collection.c = true;
        });
    }, 20);
});