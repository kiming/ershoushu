var transaction_service = exports;
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
			indice_coll.findOne({type: 'order'}, function(err, out){
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
		var time = (new Date()).getTime() + 2592000000;
		collection.update({tid: tid}, {$set: {status: 2, endTime: time}}, function(err, result) {
			if (err)
				return callback(err);
			if (!result)
				return callback(-1);
			return callback(err, true);
		});
	});
};

transaction_service.checkDupOrder = function(uid, bid, callback) {
	db.collection('orders', function(err, collection) {
		collection.findOne({ber: uid, bid: bid}, function(err, one) {
			if (err)
				return callback(err);
			if (one)
				return callback(null, true);
			return callback(null, false);
		});
	});
};

transaction_service.cancelOther = function(uid, bid, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		collection.update({bid: bid, ber: {$ne: uid}, status: 1}, {$set: {status: -2}}, function(err, result) {
			if (err)
				return callback(err);
			return callback(null, true);
		});
	});
};

transaction_service.denyTransaction = function(tid, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		collection.update({tid: tid}, {$set: {status: -2}}, function(err, result) {
			if (err)
				return callback(err);
			return callback(null, true);
		});
	});
};

transaction_service.cancelTransaction = function(tid, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		collection.update({tid: tid}, {$set: {status: -1}}, function(err, result) {
			if (err)
				return callback(err);
			return callback(null, true);
		});
	});
};

transaction_service.returnBook = function(tid, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		var time = (new Date()).getTime();
		collection.update({tid: tid}, {$set: {status: 3, returnTime: time}}, function(err, result) {
			if (err)
				return callback(err);
			return callback(null, result);
		});
	});
};

transaction_service.commentTransaction = function(isowner, tid, comment, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		var time = (new Date()).getTime();
		var commentobj;
		if (isowner)
			commentobj = {time: time, comment1: comment};
		else
			commentobj = {time: time, comment2: comment};
		collection.update({tid: tid}, {$set: commentobj}, function(err, flag) {
			if (err)
				return callback(err);
			return callback(null, flag);
		});
	});
};

transaction_service.finishTransaction = function(tid, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		collection.update({tid: tid}, {$set: {status: 4}}, function(err, flag) {
			if (err)
				return callback(err);
			return callback(null, flag);
		});
	});
};

transaction_service.getAllComments = function(bid, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		collection.find({bid: bid, status: 4}, {tid: 1, comment1: 1, comment2: 1, _id: 0}).sort({startTime: -1}).toArray(function(err, docs) {
			if (err)
				return callback(err);
			return (null, docs);
		});
	});
};

transaction_service.getAllTransOfBids = function(bids, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		collection.find({bid: {$in: bids}}, {_id: 0}).sort({startTime: -1}).toArray(function(err, docs) {
			if (err)
				return callback(err);
			return callback(null, docs);
		});
	});
};

transaction_service.getAllTransOfUser = function(uid, callback) {
	db.collection('orders', function(err, collection) {
		if (err)
			return callback(err);
		collection.find({ber: uid}, {_id: 0}).sort({startTime: -1}).toArray(function(err, docs) {
			if (err)
				return callback(err);
			return callback(null, docs);
		});
	});
};