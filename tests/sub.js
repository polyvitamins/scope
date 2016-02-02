
var tap = require('tap');
var Scope = require('./../index.js');
var tester;

var tester = new Scope();

var someClass = function() {
	this.b = 2;
}
someClass.prototype = {
	constructor: someClass,
	c: function() { this.c = 3; }
};

var someObject = new someClass();

tap.test('new scope by class', function planned(t) {
    t.plan(5);
    
    var sub = tester.$newScope(someClass);
    t.ok(sub.b==2, 'sub.b must be 2');
    t.ok("function"===typeof sub.c, 'sub.c must be prototype function');
    t.ok("function"===typeof sub.$digest, 'sub.$digest must be function');
    t.ok("object"===typeof sub.$$watchers, 'sub.$$watchers must be an array');

    t.ok("object"===typeof sub.$$watchers, 'sub.$$watchers must be an array');
});



tap.test('new scope by charge', function planned(t) {
    t.plan(5);
    
    var sub = tester.$newScope(someObject);
    t.ok(sub.b==2, 'sub.b must be 2');
    t.ok("function"===typeof sub.c, 'sub.c must be prototype function again');
    t.ok("function"===typeof sub.$digest, 'sub.$digest must be function again');
    t.ok("object"===typeof sub.$$watchers, 'sub.$$watchers must be an array again');
    t.ok("object"===typeof sub.$$parentScope, 'sub.$$parentScope must be an object');
});

tap.test('some class has no scope sings after creating', function planned(t) {
    t.plan(1);
    
    var sub2 = new someClass();

    t.ok("function"!==typeof someClass.prototype.$digest, "someClass should have no $digest function");
    /*t.ok(sub2.b==2, 'sub.b must be 2');
    t.ok("function"===typeof sub2.c, 'sub.c must be prototype function');
    t.ok("function"!==typeof sub2.$digest, 'sub.$digest must be not a function, but there it is '+someClass.prototype.$digest);
    t.ok("object"!==typeof sub2.$$watchers, 'sub.$$watchers must be an array');*/
});
