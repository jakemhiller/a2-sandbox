var express = require('express'),
    nunjucks = require('nunjucks'),
    fs = require('fs'),
    util = require('util'),
    _ = require('underscore'),
    app = express(),
    port = process.env.PORT || 1168,
    config = JSON.parse(fs.readFileSync('config.json')),
    a2 = require('./a2/lib/core');

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
env.express(app);

// Configure the express app
app.use(express.bodyParser());
app.use(express.static('public'));
app.use(express.logger('dev'));

// Bootstrap a2 for this specific app, using the config settings
// intended for a2 (so the rest of our config object can be
// project-specific if desired)

config.a2.extensions = [ __dirname + '/a2' ];

a2.bootstrap(app, config.a2);

app.get('/', function(req, res) {
  res.render('index.html');
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
  a2.validateArea(req.body, {}, function(err, area) {
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
