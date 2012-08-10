module.exports = function(app, express) {
  app.use(express.logger('dev'));
  app.use(express.static('static'));
};