
var tap = require('tap');
var Scope = require('./../index.js');
var tester;
var collection = {
    "a": {"hello": "world"},
    "b": 123,
    "c": null
};

tap.test('watcher in deep mode', function planned(t) {
    t.plan(7);
    tester = new Scope();

   tester.person = {
        name: 'Morulus',
        email: 'vladimirmorulus@gmail.com'
    };

    tester.hello = 'world';

    tester.h1 = 'h2';

    tester.$fetch('person', function(person) {
        t.ok(person.name=='Morulus', 'person.name must be');
    });

    tester.$fetch('?person', function(person, diff, last) {
        t.ok((person && diff && last), 'fetch must have value, diff and last values.');
    });

    tester.$fetch(['?person', 'hello'], function(person, hello) {
        t.ok((person && hello=='world'), 'multiple request must return two arguments');
    });

    tester.$fetch(['?person', '+hello'], function(person, hello) {
        if (hello=='world') t.ok((hello=='world'&&person instanceof Array), 'wtf1');
        if (hello=='universe') t.ok((hello=='universe'), 'wtf2');
    });

    tester.$eval('hello="universe"');

    tester.$fetch(['+person'], function(person) {
        if (person.company) t.bailout("It cant be!");
    });

    tester.$fetch(['++person'], function(person) {
        t.ok((person), 'deepwatch item');
    });

    tester.$fetch([function() {
        return tester.h1;
    }], function(h1) {
        t.ok(h1==='h2', 'custom function result');
    });

    tester.$eval('person.company="ids360"');
});