Scope
--

This is class of scope model. It allows you to create reverse binding model and controller. Approximately the same as angular does.

## Basis methods

### $watch(exprFn, callback)
The method is creates new watcher for arbitrary function result. Callback function will take result of exprFn function every time when digest-loop finds difference between old and new result.

```js
test.abc = 123;
test.$watch(function() {
	return this.abc;
}, function(val) {
	console.log('abc is ', val); // abc is 123
});

test.$eval(function() {
	this.abc = 456;
});

// watcher fires again with val = 456;

```

The method return self unwatcher as function.

```js
var unwatcher = test.$watch(function() {
	return this.abc;
}, function(val) {
	console.log('abc is ', val); // abc is 123
});

unwacther(); // Destroy watcher
```

### $eval(callback)
Executes callback function and starts digest-loop for own scope and its childs.

### $apply(callback)
Executes callback function and starts digest-loop for all scope tree.

### $digest()
Starts the digest loop forcibly

## Alfa-version
This class is unfinished and can be not sustainable yet. Use it at your own risk.

## License
MIT

## Author
Vladimir Kalmykov (Morulus) <vladimirmorulus@gmail.com>