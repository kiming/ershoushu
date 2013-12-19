var transation_service = exports;
//var mongodb = require('../models/db');
var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var db;

MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, getdb){
	if (err)
		return console.log(err);
	db = getdb;
});

transaction_service.createTransaction = function(order, callback) {
	db.collection('orders', function(err, collection){
		if (err)
			return callback(err);
		db.collection('indices', function(err, indice_coll) {
			if (err)
				return callback(err);
			indice_coll.findOne({type: 'book'}, function(err, out){
				if (err)
					return callback(err);
				order.tid = out.id;

				collection.insert(order, {
					safe: true
				}, function(err, db_order) {
					if (err)
						return callback(err);
					indice_coll.update({type: 'order'}, {$inc: {id: 1}}, function(err, result){
						if (err)
							return callback(err);
						if (!db_order)
							return callback(-1);
						return callback(null, db_order[0]);
					});
				});
			});
		});
	});
};

transaction_service.getTransactionByTid = function(tid, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		collection.findOne({tid: tid}, function(err, entry) {
			if (err)
				return callback(err);
			return callback(err, entry);
		});
	});
};

transaction_service.updateTransactionByOwnerPermit = function(tid, callback) {
	db.collection('orders', function(err, collection) {
		collection.update({tid: tid}, {$set: {status: 2}}, function(err, result) {
			if (err)
				return callback(err);
			if (!result)
				return callback(-1);
			return callback(err, result[0]);
		});
	});
};