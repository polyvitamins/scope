polypromise
--
Expand classic Promise to use it in different modes.

## Classic promise
```
var Promise = require('polypromise').Promise;
new Promise(function(resolve, reject) {

});
```

## Pending
Similar to the Promise, but allows you to glue multiple requests into one, provided that the request data match. Additionally it allows you to send advanced arguments to the function.
This allows to perform several queries without multiple requests.
```
var Pending = require('polypromise').Pending;

// First request
new Pending(function(resolve, reject, url) {
	$.get(url, function(data) {
		resolve(data);
	});
}, ['my/ajax/url'])
.then(function(data) {
	// Got data
});

// Second request
new Pending(function(resolve, reject, url) {
	$.get(url, function(data) {
		resolve(data);
	});
}, ['my/ajax/url'])
.then(function(data) {
	// Got data
});
```
Ajax request inside the Pending will be called only once for both callers

## Promises
Allow to join lot of Pendings to one
```
var Promises = require('polypromise').Promises;
new Promises(function(Promise) {
	for (var i = 0;i<5;++i) {
		new Promise(function(resolve, reject) { ... })
	}
})
.then(function(result1, result2, result3) {
	// All ready
	// result1 - result of Promise 1
	// result2 - result of Promise 2
	// result3 - result of Promise 3
});
```

If at least one of sub-Pendings reject result, anyway function will have the results of each Promise.
```
var Promises = require('polypromise').Promises;
new Promises(function(Promise) {
	new Promise(function(resolve, reject) { resolve('ok'); });
	new Promise(function(resolve, reject) { reject('Shit happens'); });
	new Promise(function(resolve, reject) { resolve('ok'); });
})
.catch(function(result1, result2, result3) {
	// All ready
	// result1 = 'ok'
	// result2 = 'Shit happens'
	// result3 = 'ok'
});
```