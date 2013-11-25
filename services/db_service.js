var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, db){
	if (err)
		return console.log(err);
	exports.db = db;
});