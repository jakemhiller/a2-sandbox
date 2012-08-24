var express = require('express');
var fs = require('fs');
var util = require('util');

var app = express();
app.set('view engine', 'jade');
var port = process.env.PORT || 1168;
var config = JSON.parse(fs.readFileSync('config.json'));

app.contentTypes = config.contentTypes.map(function(ct) {
  require(ct);
});

app.use(express.logger('dev'));

// If static can't find something other routes get a chance to find it.
app.use(express.static('static'));

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(port, function() {
  util.log('Listening on port ' + port);
});
