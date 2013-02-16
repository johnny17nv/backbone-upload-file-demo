var path = require('path'),
    fs = require('fs');

var gm = require('gm');

exports.index = function(req, res){
  res.render('index');
};

exports.post = function(req, res){
  req.form.on('fileBegin', function(name, file){
    file.metadata = {
      name : file.name,
      owner : 'godu'
    };
  });
  req.form.on('end', function(a, b, c, d){
    var files = [];
    function addFile(file){
      files.push({
        filename : file.id,
        type : file.type
      });
    }
    for (var key in req.files) {
        if (req.files.hasOwnProperty(key)) {
          if(req.files[key] instanceof Array){
            var fo = 'ad';
            req.files[key].forEach(addFile);
          }
          else {
            addFile(req.files[key]);
          }
        }
    }
    req.files = files;

    res.end(JSON.stringify(req.files));
  });
};

exports.get = function(req, res){
  req.db.collection('fs.files', function(err, collection){
    if (err) res.send(500);
    collection.find({
      'contentType' : {
        $in : [/^image/, /^audio/, /^video/]
      }
    }, function(err, cursor){
      var array = [];
      cursor.sort({uploadDate:-1}).limit(100);
      cursor.toArray(function(err, items){
        res.json(items.map(function(item){
          return {
            filename : item._id,
            type : item.contentType
          };
        }));
      });
    });
  });
};

var resize = require('../resize.js');

exports.getFile = function(req, res){
  var readstream = req.gridFS.createReadStream(req.param('fileid'));
  readstream.on('open', function(){
    var store = readstream._store;
      res.setHeader('Content-Type', store.contentType);
      res.setHeader('Last-Modified', store.uploadDate.toUTCString());
  });
  if (req.method === 'GET') {
    if(req.param('preview')) resize.cropImage(readstream).pipe(res);
    else readstream.pipe(res);
  }
  else {
    res.setHeader('Content-Length', readstream._store.length);
    readstream.close();
    res.end(304);
  }
};