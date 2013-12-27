var message_service = exports;
var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var db;
MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, getdb){
	if (err)
		return console.log(err);
	db = getdb;
});

message_service.saveMessage = function(message, callback) {
	db.collection('messages', function(err, collection){
		if(err) {
			return callback(err);
		}
		db.collection('indices', function(err, indice_coll){
            if (err)
                return callback(err);
			indice_coll.findOne({type: 'message'}, function(err, out){
				if (err)
    				return callback(err);
    			message.mid = out.id;
    			collection.insert(message, {
    				safe: true
    			}, function(err, db_message){
    				if (err) {
    					return callback(err);
    				}
    				indice_coll.update({type: 'message'}, {$inc: {id: 1}}, function(err, result){
        				if (err) {
        					return callback(err);
        				}
        				callback(null, db_message[0]);//成功！err 为 null，并返回存储后的用户文档
        			});
    			});
			});
		});
	});
};

message_service.getAllMyMessage = function(uid, callback) {
    db.collection('messages', function(err, collection) {
        if (err)
            return callback(err);
        collection.find({toUid: uid}, {_id: 0}).sort({shelfTime: -1}).toArray(function(err, docs) {
            if (err)
                return callback(err);
            return callback(null, docs);
        });
    });
};

message_service.getMessageCount = function(uid, callback) {
    db.collection('messages', function(err, collection) {
        if (err)
            return callback(err);
        collection.count({toUid: uid, status: 0}, function(err, total) {
            if (err)
                return callback(err);
            return callback(null, total);
        });
    });
};

message_service.getMessageArray = function(uid, callback) {
    db.collection('messages', function(err, collection) {
        if (err)
            return callback(err);
        collection.find({toUid: uid, status: 0}, {_id: 0, mid: 1}).sort({mid: 1}).toArray(function(err, docs) {
            if (err)
                return callback(err);
            var output = [];
            for (var i in docs) {
                var entry = docs[i];
                output.push(entry.mid);
            }
            return callback(null, output);
        });
    });
};

message_service.markread = function(arr, callback) {
    if (arr.length == 0)
        return callback(null, 0);
    db.collection('messages', function(err, collection) {
        if (err)
            return callback(err);
        collection.update({mid: {$in: arr}}, {$set: {status: 1}}, function(err, count) {
            if (err)
                return callback(err);
            return callback(null, count);
        });
    });
};
/*
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
        var obj;
        if (!flag)//借书的话
            obj = {$set: {available: flag}, $inc: {counts: 1}};
        else 
            obj = {$set: {available: flag}};

        if (err)
            return callback(err);
        collection.update({bid: bid}, obj, function(err, mark) {
            if (err)
                return callback(err);
            return callback(null, mark);
        });
    });
};

book_service.searchAllBooks = function(key, callback) {
    db.collection('books', function(err, collection) {
        if (err)
            return callback(err);
        var word = new RegExp(key);
        collection.find({bookname: word, borrowable: true}, {$id_: 0}).sort({shelfTime: -1}).toArray(function(err, docs) {
            if (err)
                return callback(err);
            return callback(null, docs);
        });
    });
};

book_service.getMyBooks = function(uid, callback) {
    db.collection('books', function(err, collection) {
        if (err)
            return callback(err);
        collection.find({owner: uid}, {_id: 0}).sort({shelfTime: -1}).toArray(function(err, docs) {
            if (err)
                return callback(err);
            return callback(null, docs);
        });
    });
};*/