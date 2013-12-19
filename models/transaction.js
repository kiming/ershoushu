
var transaction_service = require('../services/transaction_service');
var Book = require('./book');

function Transaction(trans) {
	this.tid;//订单号
	this.ber = trans.borrower;//请求这本书的人
	this.bid = trans.bid;//图书的id
	this.comment1 = null;//borrower的评论
	this.comment2 = null;//lender的评论
/*
 * 评论示例:
 * {time: 时间, content: 内容}
 * 即包含时间和内容
 */
	this.startTime = (new Date()).getTime();//订单生成日期
	this.endTime = null;//应还日期
	this.returnTime = null;//实际归还日期
	this.status = 1;//1刚下订单、订单刚被创建，2订单得到了lender的确认，3订单已归还，正在等待双方评论 4订单已归还，双方评论完成 -1订单取消
}

module.exports = Transaction;

Transaction.prototype.save = function(callback) {
		transaction_service.createTransaction(this, callback);
};

//在/order/confirm中判断订单号是否合法
Transaction.ConfirmTransaction = function(uid, tid, callback) {
	transaction_service.getTransactionByTid(tid, function(err, tran) {
		if (err)
			return callback({err: 2, msg: '查询图书时连接错误'});
		if (!tran)
			return callback({err: 3, msg: '该订单不存在'});
		//先查找这本书
		Book.getBook(tran.bid, function(err, book) {
			if (err)
				return callback({err: 4, msg: '查询图书时连接错误'});
			if (!book)
				return callback({err: 5, msg: '该图书不存在'});
			//当前session的uid一定要是书的主人
			if (book.owner != uid)
				return callback({err: 6, msg: '您无权访问此资源！请刷新后重试！'});
			
			transaction_service.updateTransactionByOwnerPermit(tid, function(err, updated_tran) {
				if (err)
					return callback({err: 7, msg: '更新时订单时出现错误'});
				if (!updated_tran)
					return callback({err: 8, msg: '更新的时候订单突然没了'});
				if (updated_tran.status != 2)
					return callback({err: 9, msg: '更新未成功'});

				Book.changeAvailableFlag()


			});
		});
	});
};