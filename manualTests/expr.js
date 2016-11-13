var Scope = require('./../index.js');

var tester = new Scope();

tester.person = {
    name: 'Morulus',
    email: 'vladimirmorulus@gmail.com'
};

tester.hello = 'world';

tester.h1 = 'h2';

tester.$fetch('person', function(person) {
    console.log('RESULT', person);
});

tester.some = {
    deep: {
        data: {
            hello: 'world'
        }
    }
}

var scope = {
    alfa: 'omega'
}

tester.$polyscope.customization.watchExprRouters.push({
    match: /^scope\./,
    replace: /^(scope\.)/,
    overrideMethod: function(expr, callback, flags) {
        var result;

        callback(tester.$parse(expr, scope));

        return {
            destroy: function() {
                console.log('WHY DESTROY??');
            }
        }
    }
});

tester.$watch('scope', ['alfa'], function(alfa) {
    console.log(alfa == 'omega', "Custom wacther should works");
});
