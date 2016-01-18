var tap = require('tap');

var inject = require('./index.js').inject;

tap.test('General', function(t) {
	t.ok("function"===typeof inject, "injector must be a function");
	var myFunc = function($a, $b, c) {
		t.ok($a ==17, '$a must be 17, '+$a+' taken');
		t.ok(typeof $b === "function", "$b must be function");
		t.ok(c === "hello", "c must be string 'hello'");
	}

	var potion = inject(myFunc, {
		$a: 17,
		$b: function() { }
	});

	t.ok("function"===typeof potion, 'porion must be a function');
	potion("hello");
	t.end();
});
