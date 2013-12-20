var book_service = require('../services/book_service');

function Book(book) {
	this.bid;
	this.owner = book.owner;//owner的id
	this.isbn = book.isbn;
	this.bookname = book.bookname;//书名
	this.author = book.author;//作者
	this.publishDate = book.publishDate;//出版年月
	this.pages = book.pages;
	this.price = book.price;
	this.brief = book.brief;//简介
	this.shelfTime = (new Date()).getTime();//创建时间
	this.borrowable = book.borrowable;//true拥有者愿意出借此书, false不愿意
	this.available = true;//true书尚未被借，false书已被借，书刚生成时肯定是尚未被借的
	this.pics = book.pics;
};

module.exports = Book;

Book.prototype.save = function(callback) {
	book_service.saveBook(this, callback);
};

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