var express = require('express');
var util = require('util');

var app = express();
var port = process.env.PORT || 1168;

// Load the settings
require("./config.js")(app, express);

app.listen(port, function() {
  util.log('Listening on port ' + port);
});
