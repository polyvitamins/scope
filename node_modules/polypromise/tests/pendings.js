var tap = require('tap'),
Promise = require('./../index.js').Promise,
Promises = require('./../index.js').Promises,
Pending = require('./../index.js').Pending;


tap.test('Test pending with delay between requests',function (t) {
	t.plan(2);
	var firstinit=false,test3 = new Pending(function(resolve, reject, hello) {
        t.comment('Step I');
		
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

    setTimeout(function() {
    	test4 = new Pending(function(resolve, reject, hello) {
	        t.comment('Step I');
			
			firstinit = true;
			resolve(Math.random());
		}, ['hello']);

		test4.then(function(result) {
			t.comment('Step II');
			t.ok(test!==result, "pedings result must not be same ["+test+","+result+"]");
			t.end();
		})
	    .catch(function() {
	        throw e;
	    });
    }, 100);

});

