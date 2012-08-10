var express = require('express');
var fs = require('fs');
var util = require('util');

var app = express();
var port = process.env.PORT || 1168;
var config = JSON.parse(fs.readFileSync('config.json'));

app.contentTypes = config.contentTypes.map(function(ct) {
  require(ct);
});

app.use(express.logger('dev'));
app.use(express.static('static'));

app.listen(port, function() {
  util.log('Listening on port ' + port);
});
