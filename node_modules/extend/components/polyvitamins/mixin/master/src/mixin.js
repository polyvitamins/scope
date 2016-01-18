define(function() {
	var mixinup = function(a,b) { 
		for(var i in b) { 
			
			if (b.hasOwnProperty(i)) { 
	          	
				a[i]=b[i]; 
			} 
		} 
		return a; 
	};

	/*
	Функция слияние двух объектов. Объекты копируются по ссылке, поэтому любые изменения в одном объекте,
	приведут к изменениям во втором.
	Использование:
	mixin(foo, bar1, bar2, bar3 .. barN);
	*/
	return function(a) { 
		var i=1; 
		for (;i<arguments.length;i++) { 
			if ("object"===typeof arguments[i]) {

				mixinup(a,arguments[i]); 
			} 
		} 
		return a;
	}
	
});