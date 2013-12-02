
var transaction_service = require('../services/transaction_service');

fnction Transaction(trans) {
	this.tid;//订单号
	this.ber = trans.borrower;//请求这本书的人
	this.bid = trans.bid;//图书的id
	this.comment = null;//交易刚建立的时候是没有评论的
/*
 * 评论示例:
 * {time: time, content: content}
 * 即包含时间和内容
 */
	this.startTime = (new Date()).getTime();
	this.endTime;//应还日期
}

Transaction.prototype.save = function(callback) {
	transaction_service.createTransaction(this, callback);
};