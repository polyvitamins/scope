var tap = require('tap'),
Promise = require('./../index.js').Promise,
Promises = require('./../index.js').Promises,
Pending = require('./../index.js').Pending;


tap.test('Test pending with no delay',function (t) {
	t.plan(2);
	var firstinit=false,test3 = new Pending(function(resolve, reject, hello) {
        t.comment('Step I');
		if (firstinit) t.bailout("This function should not be executed");
		firstinit = true;
		resolve(Math.random());
	}, ['hello']);

	var test = null;
	test3.then(function(result) {
		test = result;
		t.comment('Step II');
		t.ok(true, 'pending must be resolved');
	})
        .catch(function() {
            throw e;
        });

	test4 = new Pending(function(resolve, reject, hello) {
        t.comment('Step I');
		if (firstinit) t.bailout("This function should not be executed");
		firstinit = true;
		resolve(Math.random());
	}, ['hello']);

	test4.then(function(result) {
		t.comment('Step II');
		t.ok(test===result, "pedings result must be same");
		t.end();
	})
        .catch(function() {
            throw e;
        });
});
