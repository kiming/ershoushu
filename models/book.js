function Book(book) {
	this.isbn = book.isbn;
	this.name = book.name;//书名
	this.author = book.author;//作者
	this.publishDate = book.publishDate;//出版年月
	this.pages = book.pages;
	this.price = book.price;
	this.brief = book.brief;//简介
	this.shelfTime = new Date();
	this.pics;
};

