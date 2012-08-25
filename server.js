var express = require('express');
var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var app = express();
app.set('view engine', 'jade');
var port = process.env.PORT || 1168;
var config = JSON.parse(fs.readFileSync('config.json'));
var a2 = require('a2-core');

// The a2 item types we want are installed
// for *this project* in its node_modules folder, which the
// a2-core module can't conveniently access. So we map the
// item type names in our configuration to the actual loaded
// type modules before calling a2.bootstrap.

config.a2.itemTypes = config.a2.itemTypeNames.map(function(itemTypeName) {
  return require(itemTypeName);
});

// Bootstrap a2 for this specific app, using the config settings
// intended for a2 (so the rest of our config object can be
// project-specific if desired)

a2.bootstrap(app, config.a2);

app.use(express.logger('dev'));

// Note that if static can't find something other routes still get a chance to find it.

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(port, function() {
  util.log('Listening on port ' + port);
});
