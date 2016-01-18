
var tap = require('tap');
var Scope = require('./../index.js');
var tester;
var collection = {
    "a": {"hello": "world"},
    "b": 123,
    "c": null
};

tap.test('watcher set', function planned(t) {
    t.plan(2);
    tester = new Scope();
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

