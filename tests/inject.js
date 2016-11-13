
var tap = require('tap');
var Scope = require('./../index.js');
var tester;
var collection = {
    "a": {"hello": "world"},
    "b": 123,
    "c": null
};

tap.test('try to inject', function planned(t) {
    t.plan(1);
    tester = new Scope();
    tester.$polyscope.injects = [
        {
            $alfa: 1,
            $omega: function() { return 3; }
        }
    ];
    var collection2 = {
        "a": {"hello": "world"},
        "b": 123,
        "c": null
    };
    var expect = collection2, count=0;
    var watcher = tester.$watch(function() {
        return collection2;
    }, function($omega, $alfa, result, diff) {

        t.ok($omega()===3 && $alfa===1, "$omega() must be 3, $alfa must be 1");

    }, Scope.POLYSCOPE_DEEP | Scope.POLYSCOPE_DITAILS);


});
