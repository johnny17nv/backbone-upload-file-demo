var mongo = require('mongodb'),
    Grid = require('gridfs-stream'),
    mongoServer = new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, { auto_reconnect : true, poolSize : 8 }),
    mongoDb = new mongo.Db('gridFS', mongoServer, { safe : false }),
    mongoGridFS = Grid(mongoDb, mongo);

module.exports = {
  mongo : {
    server : mongoServer,
    db : mongoDb,
    gfs : mongoGridFS
  } 
};