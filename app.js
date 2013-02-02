var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');

var commons = require('./commons');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  //app.use(form);
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express['static'](path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/images', routes.post);
app.get('/images', routes.get);
app.get('/statics/:fileid', routes.getFile);

var server = http.createServer(app);

commons.mongo.db.open(function(){
  server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
    console.log('Press [ENTER] to close server');

    process.stdin.resume();
    process.stdin.on('data', function(){
      process.stdin.pause();
      server.close();
    });
  });
});