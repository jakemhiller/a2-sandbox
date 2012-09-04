/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  To install nodeunit's command line tool:

  npm install -g nodeunit

  To run tests:

  nodeunit a2sandbox_test.js

  Test methods:
    test.expect(numAssertions)
    test.done()

  Note that since you must call test.done(), you can
  test asynchronous code.

  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)

*/

var _ = require('underscore');

exports['suite'] = {
  setUp: function(done) {
    done();
  },

  'open': function(test) {
    test.expect(11);
    // Mock an express app object as a context
    var app = { locals: {}, use: function() {} };
    var a2 = require('a2-core');
    var config = {
      "defaultItemType": "a2-text",
      "itemTypeNames": [
        "a2-text",
        "a2-files"
      ]
    };

    config.itemTypes = config.itemTypeNames.map(function(itemTypeName) {
      return require(itemTypeName);
    });

    a2.bootstrap(app, config);
    test.ok(app.a2);
    test.ok(app.locals.a2);

    var data = {
      itemInfos: [
        {
          type: 'a2-text',
          data: {
            'text': '<p>Once I met a man who had no <b>hat</b>.</p><p><a href="javascript:alert(5)">Forbidden</a><a href="http://permitted.example.com/">Permitted</a></p>'
          }
        },
        {
          type: 'a2-text',
          data: {
            text: 'I was sad because I had no fork.'
          }
        }
      ]
    };

    app.a2.openArea(data, {}, function(err, data) {
      test.ok(!err);
      test.ok(data);

      app.a2.validateArea(data, {}, function(err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.itemInfos.length === 2);
        test.ok(data.itemInfos[0].type);
        _.each(data.itemInfos, function(itemInfo) {
          test.ok(itemInfo.permId.length);
        });
        // The a2-text validator should have successfully blown away the XSS threat
        test.ok(data.itemInfos[0].data.text.indexOf('href="javascript:') === -1);
        // app.a2.log(data);
        test.done();
      });
    });

  }
}
// exports['awesome'] = {
//   setUp: function(done) {
//     // setup here
//     done();
//   },
//   'no args': function(test) {
//     test.expect(1);
//     // tests here
//     test.equal(a2sandbox.awesome(), 'awesome', 'should be awesome.');
//     test.done();
//   }
// };
