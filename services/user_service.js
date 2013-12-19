var user_service = exports;
//var mongodb = require('../models/db');
var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var db;

MongoClient.connect("mongodb://" + settings.host + ':' + settings.port + '/' + settings.db, function(err, getdb){
	if (err)
		return console.log(err);
	db = getdb;
});

user_service.saveUser = function(user, callback) {
    //读取 users 集合
    db.collection('users', function (err, collection) {
    	if (err) {
        	return callback(err);//错误，返回 err 信息
    	}
    	db.collection('indices', function(err, indice_coll){
    		indice_coll.findOne({type: 'user'}, function(err, out){
    			if (err) {
    				return callback(err);
    			}
    			user.uid = out.id;
    			//将用户数据插入 users 集合
    			collection.insert(user, {
        			safe: true
      			}, function (err, db_user) {
        			if (err) {
        				return callback(err);
        			}
        			indice_coll.update({type: 'user'}, {$inc: {id: 1}}, function(err, result){
        				if (err) {
        					return callback(err);
        				}
        				callback(null, db_user[0]);//成功！err 为 null，并返回存储后的用户文档
        			});
    			});
    		});		
    	});
	});
};

user_service.getUserByEmail = function(email, callback) {
	db.collection('users', function(err, collection){
		if (err) {
			return callback(err);
		}
		collection.findOne({
			email: email
		}, function(err, user){
			if (err) {
				return callback(err);
			}
			callback(null, user);
		});
	});
};

user_service.getUserByEmailAndPassword = function(email, password, callback) {
	db.collection('users', function(err, collection){
		if (err)
			return callback(err);
		collection.findOne({
			email: email,
			password: password
		}, function(err, user){
			if (err)
				return callback(err);
			callback(null, user);
		});
	});
};

/*
user_service.saveUser = function(user, callback) {
	mongodb.open(function (err, db) {
    if (err) {
    	return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
    	if (err) {
        	mongodb.close();
        	return callback(err);//错误，返回 err 信息
    	}
    	//将用户数据插入 users 集合
    	collection.insert(user, {
        		safe: true
      		}, function (err, user) {
        		mongodb.close();
        	if (err) {
        		return callback(err);
        	}
        	callback(null, user[0]);//成功！err 为 null，并返回存储后的用户文档
    		});
		});
	});
};

user_service.getUserByEmail = function(email, callback) {
	mongodb.open(function(err, db){
		if (err)
			return callback(err);
		db.collection('users', function(err, collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				email: email
			}, function(err, user){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, user);
			});
		});
	});
};
*/