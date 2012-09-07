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
    test.expect(10);
    // Mock an express app object as a context
    var app = { locals: {}, use: function() {} };
    // When this moves to an a2-core repository this require statement
    // will just be require('a2-core')
    var a2 = require(__dirname + '/../a2/lib/core');
    var config = {
      "defaultItemType": "text",
      "itemTypeNames": [
        "text",
        "files"
      ]
    };

    config.extensions = [ __dirname + '/../a2' ];

    a2.bootstrap(app, config);
    test.ok(app.locals.a2);

    var data = {
      itemInfos: [
        {
          type: 'text',
          data: {
            'text': '<p>Once I met a man who had no <b>hat</b>.</p><p><a href="javascript:alert(5)">Forbidden</a><a href="http://permitted.example.com/">Permitted</a></p>'
          }
        },
        {
          type: 'text',
          data: {
            text: 'I was sad because I had no fork.'
          }
        }
      ]
    };

    a2.openArea(data, {}, function(err, data) {
      test.ok(!err);
      test.ok(data);

      a2.validateArea(data, {}, function(err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.itemInfos.length === 2);
        a2.log(data);
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
};
