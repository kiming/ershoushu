
var transaction_service = require('../services/transaction_service');
var book_service = require('../services/book_service');
var Book = require('./book');
var Message = require('./message');
var User = require('./user');

function Transaction(trans) {
	this.tid;//订单号
	this.ber = trans.borrower;//请求这本书的人
	this.bid = trans.bid;//图书的id
	this.comment1 = null;//拥有者的评论
	this.comment2 = null;//借阅者的评论
/*
 * 评论示例:
 * {time: 时间戳, content: 内容}
 * 即包含时间和内容
 */
	this.startTime = (new Date()).getTime();//订单生成日期
	this.endTime = null;//应还日期
	this.returnTime = null;//实际归还日期
	this.status = 1;//1刚下订单、订单刚被创建，2订单得到了lender的确认，3订单已归还，正在等待双方评论 4订单已归还，双方评论完成 -1订单自己取消 -2订单被拒绝
};

module.exports = Transaction;

Transaction.prototype.save = function(callback) {
		transaction_service.createTransaction(this, callback);
};

Transaction.checkDupOrder = function(uid, bid, callback) {
	transaction_service.checkDupOrder(uid, bid, callback);
}

Transaction.getTransactionByTid = function(tid, callback) {
	transaction_service.getTransactionByTid(tid, callback);
};

//在/order/confirm中判断订单号是否合法
Transaction.ConfirmTransaction = function(uid, tid, callback) {
	transaction_service.getTransactionByTid(tid, function(err, tran) {
		if (err)
			return callback({err: 2, msg: '查询图书时连接错误'});
		if (!tran)
			return callback({err: 3, msg: '该订单不存在'});
		if (tran.status != 1)
			return callback({err: 8, msg: '该订单不是待确认状态，不可确认'});
		//先查找这本书
		Book.getBook(tran.bid, function(err, book) {
			if (err)
				return callback({err: 4, msg: '查询图书时连接错误'});
			if (!book)
				return callback({err: 5, msg: '该图书不存在'});
			//当前session的uid一定要是书的主人
			if (book.owner != uid)
				return callback({err: 6, msg: '您无权访问此资源！请刷新后重试！'});
			if (!book.available)
				return callback({err: 11, msg: '该图书已经借出'});
			
			transaction_service.updateTransactionByOwnerPermit(tid, function(err, flag) {
				if (err)
					return callback({err: 7, msg: '更新时订单时出现错误'});
				Book.occupyBook(tran.bid, function(err, flag3) {
					if (err)
						return callback(err);
					User.getUserSafe(uid, function(err, user) {
						if (err)
							return callback(err);
						var message = new Message({
							tid: tid,
							fromUid: uid,
							toUid: tran.ber,
							mType: 3,
							bookId: tran.bid,
							ownerName: user.nickname,
							bookname: book.bookname
						});
						message.save(function(err) {
							if (err)
								return callback(err);
							transaction_service.cancelOther(tran.ber, tran.bid, function(err, canceledtrans) {
								if (err)
									return callback({err: 9, msg: '连接出现错误'});
								var count = 0, limit = canceledtrans.length;
								if (limit == 0)
									return callback(null, true);
								canceledtrans.forEach(function(elem) {
									var message2 = new Message({
										tid: elem.tid,
										fromUid: uid,
										toUid: elem.ber,
										mType: 2,
										bookId: tran.bid,
										ownerName: user.nickname,
										bookname: book.bookname
									});
									message2.save(function(err) {
										if (err)
											return callback(err);
										count++;
										if (count == limit)
											return callback(null, true);
									});
								});
							});
						});
					});
				});
			});
		});
	});
};

Transaction.refuseTransaction = function(uid, tid, callback) {
	transaction_service.getTransactionByTid(tid, function(err, tran) {
		if (err)
			return callback({err: 2, msg: '查询图书时连接错误'});
		if (!tran)
			return callback({err: 3, msg: '该订单不存在'});
		if (tran.status != 1)
			return callback({err: 4, msg: '该订单不是待确认状态，不可拒绝'});
		Book.getBook(tran.bid, function(err, book) {
			if (err)
				return callback({err: 5, msg: '查询图书时连接错误'});
			if (!book)
				return callback({err: 6, msg: '该图书不存在'});
			if (book.owner != uid)
				return callback({err: 7, msg: '您无权访问此资源！请刷新后重试！'});
			transaction_service.denyTransaction(tid, function(err, flag) {
				if (err)
					return callback({err: 20, msg: '连接出现错误'});
				if (!flag)
					return callback({err: 21, msg: '出现不明错误'});
				transaction_service.getTransactionByTid(tid, function(err, newtran) {
					if (err)
						return callback({err: 22, msg: '连接出现错误'});
					if (!newtran)
						return callback({err: 23, msg: '订单神秘消失，详情请收看走进科学'});
					if (newtran.status != -2)
						return callback({err: 24, msg: '拒绝订单失败，请重试'});
					return callback(null, newtran);
				});
			});
		});
	});
};

Transaction.cancelTransaction = function(uid, tid, callback) {
	transaction_service.getTransactionByTid(tid, function(err, tran) {
		if (err)
			return callback({err: 2, msg: '查询图书时连接错误'});
		if (!tran)
			return callback({err: 3, msg: '该订单不存在'});
		if (tran.status != 1)
			return callback({err: 4, msg: '该订单不是待确认状态，不可取消'});
		if (uid != tid.ber)
			return callback({err: 5, msg: '非法访问资源，这不是您的订单'});
		transaction_service.cancelTransaction(tid, function(err, flag) {
			if (err)
				return callback({err: 20, msg: '连接出现错误'});
			if (!flag)
				return callback({err: 21, msg: '出现不明错误'});
			transaction_service.getTransactionByTid(tid, function(err, newtran) {
				if (err)
					return callback({err: 22, msg: '连接出现错误'});
				if (!newtran)
					return callback({err: 23, msg: '订单神秘消失，详情请收看走进科学'});
				if (newtran.status != -2)
					return callback({err: 24, msg: '拒绝订单失败，请重试'});
				return callback(null, newtran);
			});
		});
	});
};

Transaction.returnBook = function(uid, tid, callback) {
	transaction_service.getTransactionByTid(tid, function(err, tran) {
		if (err)
			return callback({err: 2, msg: '查询图书时连接错误'});
		if (!tran)
			return callback({err: 3, msg: '该订单不存在'});
		if (tran.status != 2)
			return callback({err: 4, msg: '该订单不在，不可取消'});
		Book.getBook(tran.bid, function(err, book) {
			if (err)
				return callback({err: 5, msg: '查询图书时连接错误'});
			if (!book)
				return callback({err: 6, msg: '该图书不存在'});
			if (book.owner != uid)
				return callback({err: 7, msg: '您无权访问此资源！请刷新后重试！'});

			transaction_service.returnBook(tid, function(err, flag1) {
				if (err)
					return callback({err: 11, msg: '连接出现问题'});
				if (flag1 == 0)
					return callback({err: 12, msg: '更新数据库失败'});

				Book.releaseBook(tran.bid, function(err, flag2) {
					if (err)
						return callback(err);
					if (!flag2)
						return callback({err: 29, msg: '不明错误'});
					transaction_service.getTransactionByTid(tid, function(err, newtran) {
						if (err)
							return callback({err: 31, msg: '连接出现错误'});
						if (!newtran)
							return callback({err: 32, msg: '订单神秘消失，详情请收看走进科学'});
						if (newtran.status != 3)
							return callback({err: 33, msg: '归还失败'});
						return callback(null, newtran);
					});
				});
			});
		});
	});
};

Transaction.OwnerComment = function(uid, tid, comment, callback) {
	transaction_service.getTransactionByTid(tid, function(err, tran) {
		if (err)
			return callback({err: 2, msg: '查询图书时连接错误'});
		if (!tran)
			return callback({err: 3, msg: '该订单不存在'});
		if (tran.status != 3)
			return callback({err: 4, msg: '该订单不处于可以评论的状态'});
		if (tran.comment1)
			return callback({err: 5, msg: '您已评论过，无需再进行评论'});
		Book.getBook(tran.bid, function(err, book) {
			if (err)
				return callback({err: 7, msg: '查询图书时连接错误'});
			if (!book)
				return callback({err: 8, msg: '该图书不存在'});
			if (book.owner != uid)
				return callback({err: 9, msg: '您无权访问此资源！请刷新后重试！'});
			transaction_service.commentTransaction(true, tid, comment, function(err, flag1) {
				if (err)
					return callback({err: 11, msg: '连接出现错误'});
				if (flag1 == 0)
					return callback({err: 12, msg: '更新没有成功'});
				transaction_service.getTransactionByTid(tid, function(err, newtran1) {
					if (err)
						return callback({err: 21, msg: '连接出现错误'});
					if (!newtran)
						return callback({err: 22, msg: '订单神秘消失，详情请收看走进科学'});
					if (newtran.comment1 && newtran.comment2) {
						transaction_service.finishTransaction(tid, function(err, flag2) {
							if (err)
								return callback({err: 31, msg: '连接出现错误'});
							if (flag2 == 0)
								return callback({err: 32, msg: '更新没有成功'});
							transaction_service.getTransactionByTid(tid, function(err, newtran2) {
								if (err)
									return callback({err: 41, msg: '连接出现错误'});
								if (!newtran2)
									return callback({err: 42, msg: '订单神秘消失，详情请收看走进科学'});
								return callback(null, newtran2);
							});
						});
					}
					else
						return callback(null, newtran1);
				});
			});
		});
	});
};

Transaction.ReaderComment = function(uid, tid, comment, callback) {
	transaction_service.getTransactionByTid(tid, function(err, tran) {
		if (err)
			return callback({err: 2, msg: '查询图书时连接错误'});
		if (!tran)
			return callback({err: 3, msg: '该订单不存在'});
		if (tran.status != 3)
			return callback({err: 4, msg: '该订单不处于可以评论的状态'});
		if (tran.comment2)
			return callback({err: 5, msg: '您已评论过，无需再进行评论'});
		if (tran.ber != uid)
			return callback({err: 6, msg: '您无权访问此资源！请刷新后重试！'});
		transaction_service.commentTransaction(false, tid, comment, function(err, flag1) {
			if (err)
				return callback({err: 11, msg: '连接出现错误'});
			if (flag1 == 0)
				return callback({err: 12, msg: '更新没有成功'});
			transaction_service.getTransactionByTid(tid, function(err, newtran1) {
				if (err)
					return callback({err: 21, msg: '连接出现错误'});
				if (!newtran)
					return callback({err: 22, msg: '订单神秘消失，详情请收看走进科学'});
				if (newtran.comment1 && newtran.comment2) {
					transaction_service.finishTransaction(tid, function(err, flag2) {
						if (err)
							return callback({err: 31, msg: '连接出现错误'});
						if (flag2 == 0)
							return callback({err: 32, msg: '更新没有成功'});
						transaction_service.getTransactionByTid(tid, function(err, newtran2) {
							if (err)
								return callback({err: 41, msg: '连接出现错误'});
							if (!newtran2)
								return callback({err: 42, msg: '订单神秘消失，详情请收看走进科学'});
							return callback(null, newtran2);
						});
					});
				}
				else
					return callback(null, newtran1);
			});
		});
	});
};

//查找
Transaction.borrowFromMe = function(uid, callback) {
	book_service.getMyBooks(uid, function(err, docs2) {
		var bids = [];
        for (var i in docs2)
            bids.push(docs2[i].bid);
		if (err)
			return callback({err: 11, msg: '连接出现错误'});
		transaction_service.getAllTransOfBids(bids, function(err, docs) {
			if (err)
				return callback({err: 12, msg: '连接又出现了问题'});
			return callback(null, docs);
		});
	});
};

Transaction.borrowToMe = function(uid, callback) {
	transaction_service.getAllTransOfUser(uid, function(err, docs) {
		if (err)
			return callback({err: 11, msg: '连接出现问题'});
		return callback(null, docs);
	});
};

Transaction.myBorrow = function(uid, callback) {
	transaction_service.getBorrowedTrans(uid, callback);
};

Transaction.newestTran = function(bid, callback) {
	transaction_service.newestTran(bid, callback);
};
