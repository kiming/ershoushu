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
			return callback(err);
		}
		db.collection('indices', function(err, indice_coll){
            if (err)
                return callback(err);
			indice_coll.findOne({type: 'book'}, function(err, out){
				if (err)
    				return callback(err);
    			book.bid = out.id;

    			collection.insert(book, {
    				safe: true
    			}, function(err, db_book){
    				if (err) {
    					return callback(err);
    				}
    				indice_coll.update({type: 'book'}, {$inc: {id: 1}}, function(err, result){
        				if (err) {
        					return callback(err);
        				}
        				callback(null, db_book[0]);//成功！err 为 null，并返回存储后的用户文档
        			});
    			});
			});
		});
	});
};

book_service.getBookByBid = function(bid, callback) {
    db.collection('books', function(err, collection){
        if (err) {
            return callback(err);
        }
        collection.findOne({bid: bid}, function(err, book){
            if (err) {
                return callback(err);
            }
            return callback(null, book);
        });

    });
};

book_service.modifyBookByBid = function(bid, book, callback) {
    db.collection('books', function(err, collection) {
        if (err)
            return callback(err);
        collection.update({bid: bid}, {'$set': {
            isbn: book.isbn,
            bookname: book.bookname,
            author: book.author,
            publishDate: book.publishDate,
            pages: book.pages,
            price: book.price,
            brief: book.brief,
            borrowable: book.borrowable,
            pics: book.pics
        }}, function(err, num){
            if (err)
                return callback(err);
            return callback(null, num);
        });
    });
};

book_service.checkExistAndOwner = function(bid, callback){
    db.collection('books', function(err, collection) {
        if (err)
            return callback(err);
        collection.findOne({bid: bid}, function(err, book) {
            if (err)
                return callback(err);
            if (!book)
                return callback(null, {exist: false});
            return callback(null, {
                exist: true,
                be: book.borrowable,
                ae: book.available,
                oid: book.owner
            });
        });
    });
};

book_service.changeAvailableFlag = function(flag, bid, callback) {
    db.collection('books', function(err, collection) {
        if (err)
            return callback(err);
        collection.update({bid: bid}, {$set: {available: flag}}, function(err, mark) {
            if (err)
                return callback(err);
            return callback(null, mark);
        });
    });
};