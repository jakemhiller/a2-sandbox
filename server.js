var express = require('express');
var util = require('util');

var app = express();
var port = process.env.PORT || 1168;

app.use(express.logger('dev'));
app.use(express.static('static'));

app.listen(port, function() {
  util.log('Listening on port ' + port);
});
