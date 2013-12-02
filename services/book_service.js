var book_service = exports;
var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var db;
MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, getdb){
	if (err)
		return console.log(err);
	db = getdb;
});

book_service.saveBook = function(book, callback) {
	db.collection('books', function(err, collection){
		if(err) {
			db.close();
			return callback(err);
		}
		db.collection('indices', function(err, indice_coll){
			indice_coll.findOne({type: 'book'}, function(err, out){
				if (err) {
					db.close();
    				return callback(err);
    			}
    			book.bid = out.id;

    			collection.insert(book, {
    				safe: true
    			}, function(err, db_book){
    				if (err) {
    					db.close();
    					return callback(err);
    				}
    				indice_coll.update({type: 'book'}, {$inc: {id: 1}}, function(err, result){
        				if (err) {
        					db.close();
        					return callback(err);
        				}
        				callback(null, db_book[0]);//成功！err 为 null，并返回存储后的用户文档
        			});
    			});
			});
		});
	});
};