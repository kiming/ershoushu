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