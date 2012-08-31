var express = require('express');
var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var app = express();
app.use(express.bodyParser());
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

var areas = {
  body: {

  },
  sidebar: {

  }
};

app.get('/admin/area/:id', function(req, res) {
  var id = req.params.id;
  if (!_.has(areas, id))
  {
    res.status = 404;
    res.send(404);
    return;
  }
  res.send(JSON.stringify(areas[id]));
});

app.put('/admin/area/:id', function(req, res) {
  var id = req.params.id;
  if (!_.has(areas, id)) {
    res.status = 404;
    res.send(404);
  }
  // Data arrives as JSON, Express turns that into a nice req.body object
  console.log(req.body);
  app.a2.validateArea(req.body, {}, function(err, area) {
    if (err) {
      console.log('error in post');
      res.send(500, err);
      return;
    }
    areas[id] = area;
    res.send(JSON.stringify(areas[id]));
  });
});

app.listen(port, function() {
  util.log('Listening on port ' + port);
});
