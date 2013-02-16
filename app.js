var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    mongo = require('mongodb');

var server = new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, { auto_reconnect : true, poolSize : 8 }),
    db = new mongo.Db('gridFS', server, { safe : false });

var app = express();
var multipart = require('connect-multipart-gridform');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express['static'](path.join(__dirname, 'public')));
  app.use(function(req, res, next){
    req.db = db;
    next();
  });
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/images',multipart({
    db : db,
    mongo : mongo,
    defer : true
  }), routes.post);
app.get('/images', routes.get);
app.all('/statics/images/:fileid', function(req, res, next){
  req.gridFS = multipart.gridform.gridfsStream(db, mongo);
  next();
} ,routes.getFile);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});