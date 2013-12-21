var init_service = exports;
var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var db;
MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, getdb){
	if (err)
		return console.log(err);
	db = getdb;
});

init_service.init = function(callback) {
	db.collection('books', function(err, collection1){
		if(err)
			return callback(err);
		collection1.remove(function(err, flag1) {
			if (err)
				return callback(err);
			db.collection('orders', function(err, collection2) {
				if (err)
					return callback(err);
				collection2.remove(function(err, flag2) {
					if (err)
						return callback(err);
					db.collection('users', function(err, collection3) {
						if (err)
							return callback(err);
						collection3.remove(function(err, flag3) {
							if (err)
								return callback(err);
							collection3.insert({uid: 0, email: 'tttt', password: "32bf0e6fcff51e53bd74e70ba1d622b2"}, function(err, flag) {
								if (err)
									return callback(err);
								db.collection('indices', function(err, collection4) {
									if (err)
										return callback(err);
									collection4.remove(function(err, flag4) {
										if (err)
											return callback(err);
										var obj = [
											{type: 'user', id: 1},
											{type: 'book', id: 1},
											{type: 'order', id: 2013000003}
										];
										collection4.insert(obj, function(err, flag5) {
											if (err)
												return callback(err);
											return callback(null, true);
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
};