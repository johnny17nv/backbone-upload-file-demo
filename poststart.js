var fs = require('fs')
  , path = require('path');

fs.readdir('public/images', function(err, files){
  if (err) return console.error(err);

  files.forEach(function(file){
  	if (file === '.gitignore') return;
  	
    fs.unlink( path.join('public/images', file) , function(err){
      if(err) console.error(err);
    });
  });

});