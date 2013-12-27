var message_service = require('../services/message_service');

function Message(message) {
	this.mid;
	this.tid = message.tid;
	this.fromUid = message.fromUid;
	this.toUid = message.toUid;
	//type 1:发起借阅请求 2：拥有者拒绝 3：拥有者同意 4拥有者确认还书 5借阅者发起评论 6拥有者回复评论
	this.mType = message.mType;
	this.bookId = message.bookId;
	this.cTime = (new Date()).getTime();//创建时间
	/*convenient content*/ 
	this.fromUserName = message.ownerName;
	this.bookName = message.bookname;
	this.status = 0;//未读
};

module.exports = Message;

Message.prototype.save = function(callback) {
	message_service.saveMessage(this, callback);
};

Message.getAllMyMessage = function(uid, callback) {
	message_service.getAllMyMessage(uid, callback);
};

Message.getMessageCount = function(uid, callback) {
	message_service.getMessageCount(uid, callback);
};

Message.getMessageArray = function(uid, callback) {
	message_service.getMessageArray(uid, callback);
};

Message.markread = function(arr, callback) {
	message_service.markread(arr, callback);
};
	/*unimplement service function*/


/*

Book.getBook = function(bid, callback) {
	book_service.getBookByBid(bid, callback);
};

Book.modifyBook = function(bid, book, callback) {
	book_service.modifyBookByBid(bid, book, callback);
}

Book.checkExistAndOwner = function(bid, callback) {
	book_service.checkExistAndOwner(bid, callback);
};

Book.occupyBook = function(bid, callback) {
	Book.getBook(bid, function(err, book) {
		if (err)
			return callback({err: 20, msg: '连接问题'});
		if (!book)
			return callback({err: 21, msg: '图书不存在'});
		if (!book.available)
			return callback({err: 22, msg: '图书已借出'});

		book_service.changeAvailableFlag(false, bid, function(err, mark){
			if (err)
				return callback({err: 23, msg: '连接问题'});
			if (mark == 0)
				return callback({err: 24, msg: '图书不可借'});
			return callback(null, true);
		});
	});
};

Book.releaseBook = function(bid, callback) {
	Book.getBook(bid, function(err, book) {
		if (err)
			return callback({err: 20, msg: '连接问题'});
		if (!book)
			return callback({err: 21, msg: '图书不存在'});
		if (book.available)
			return callback({err: 22, msg: '该图书早已归还'});

		book_service.changeAvailableFlag(true, bid, function(err, mark) {
			if (err)
				return callback({err: 23, msg: '连接问题'});
			if (mark == 0)
				return callback({err: 24, msg: '图书不可归还'});
			return callback(null, true);
		});
	});
};

Book.getCommentOfABook = function(bid, callback) {
	transaction_service.getAllComments(bid, function(err, docs) {
		if (err)
			return callback({err: 2, msg: '连接错误'})
		return callback(null, docs);
	});
};

Book.searchBook = function(key, callback) {
	book_service.searchAllBooks(key, callback);
};

Book.getAllBooksOfOwner = function(uid, callback) {
	book_service.getMyBooks(uid, callback);
};
*/