var express = require('express');
var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var app = express();
app.set('view engine', 'jade');
var port = process.env.PORT || 1168;
var config = JSON.parse(fs.readFileSync('config.json'));
var a2 = require('a2-core');

// a2.registerTypes(config.itemTypes);
app.itemTypes = config.itemTypes.map(function(ct) {
  require(ct);
});

app.use(express.logger('dev'));

// If static can't find something other routes get a chance to find it.
app.use(express.static('static'));

app.locals.a2scripts =
app.locals.a2scripts = function()
{
  var data = ['/a2/core/js/core.js', '/a2/core/js/area.js', '/a2/core/js/itemWrapper.js', '/a2/itemTypes/text/js/type.js'];
  return _.reduce(data, function(memo, script) {
    return memo + '<script src="' + script + '"></script>' + "\n";
  }, '');
}

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(port, function() {
  util.log('Listening on port ' + port);
});
