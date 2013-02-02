var path = require('path')
  , fs = require('fs');

exports.index = function(req, res){
  res.render('index');
};

exports.post = function(req, res){
  if(req.files.hasOwnProperty('file')){
    var file = req.files.file;
    res.send({
      name: path.basename(file.path)
    });
  }
  else res.end(500);
};

exports.get = function(req, res){
  fs.readdir('public/images', function(err, files){
    if (err) return res.end(500); 

    res.send(files.map(function(file){
      return {
        name : file
      };
    }));
  });
};