var path = require('path'),
    fs = require('fs'),
    gridform = require('gridform');

var mongo = require('mongodb'),
    commons = require('../commons.js');
    db = commons.mongo.db,
    gfs = commons.mongo.gfs;


var gm = require('gm');

gridform.db = db;
gridform.mongo = mongo;

exports.index = function(req, res){
  res.render('index');
};

exports.post = function(req, res){
  var form = gridform();

  form.on('fileBegin', function (name, file) {
    file.metadata = {
      name : file.name
    };
  });

  form.parse(req, function (err, fields, files) {
    
    if(err) res.end(500);
    else if (!/^image\//.test(files.file.type)) res.end(500);
    else res.json({
      filename : files.file.id
    });
  });
};

exports.get = function(req, res){
  db.collection('fs.files', function(err, collection){
    if (err) res.send(500);
    collection.find({'contentType' : /^image\// }, function(err, cursor){
      var array = [];
      cursor.sort({uploadDate:-1}).limit(100);
      cursor.toArray(function(err, items){
        res.json(items.map(function(item){
          return {
            filename : item._id
          };
        }));
      });
    });
  });
};

var resize = require('../resize.js');

exports.getFile = function(req, res){
  var readstream = gfs.createReadStream(req.param('fileid'));
  if(req.param('preview')) resize.cropImage(readstream).pipe(res);
  else readstream.pipe(res);
};