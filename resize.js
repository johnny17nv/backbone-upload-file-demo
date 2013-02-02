var spawn = require('child_process').spawn;
var Stream = require('stream');

/**
 * crops and resizes images to our desired size
 * @param {Stream} streamIn in stream containing the raw image
 * @return {Stream}
 */
exports.cropImage = function(streamIn){

  var command = 'convert';

  // http://www.imagemagick.org/Usage/resize/#space_fill
  var args = [
    "-",                     // use stdin
    "-resize", "300x300",       // resize width to 640
//    "-resize", "x360<",      // resize height if it's smaller than 360
//    "-gravity", "center",    // sets the offset to the center
//    "-crop", "640x360+0+0",  // crop
//    "+repage",               // reset the virtual canvas meta-data from the images.
    "-"                      // output to stdout
  ];

  var proc = spawn(command, args);

  var stream = new Stream();

  proc.stderr.on('data', stream.emit.bind(stream, 'error'));
  proc.stdout.on('data', stream.emit.bind(stream, 'data'));
  proc.stdout.on('end', stream.emit.bind(stream, 'end'));
  proc.on('error', stream.emit.bind(stream, 'error'));

  streamIn.pipe(proc.stdin);

  return stream;
};