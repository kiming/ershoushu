var User = require('../models/user');
var Book = require('../models/book');
var Transaction = require('../models/transaction')
var file_service = require('../services/file_service');
var init_service = require('../services/init_service');

module.exports = function(app) {
    app.get('/init', function(req, res) {
        init_service.init(function(err, amount) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '失败'}}));
            return res.end(JSON.stringify({result: 0, data: {amount: amount}}));
        });
    });

    app.get('/ordertest', function(req, res) {
        return res.render('order_test');
    });

    app.get('/', function(req, res){
        res.render('index.ejs', {
            title: "阿汤是SB"
        });
    });

    app.post('/reg', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.body.password)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入密码'}}));
    	var email = req.body.email,
    		nickname = req.body.nickname,
    		password = require('crypto').createHash('md5').update(req.body.password).digest('hex'),
            address = req.body.address,
            zipcode = req.body.zipcode,
            zip = parseInt(zipcode),
            tel = req.body.tel,
            mobile = req.body.mobile;
        if (!email)
            return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '没有输入email'}}));
        if (!nickname)
            return res.end(JSON.stringify({result: 0, data: {err: 3, msg: '没有输入昵称'}}));
        if (!address)
            return res.end(JSON.stringify({result: 0, data: {err: 4, msg: '没有输入地址'}}));
        if (!zipcode)
            return res.end(JSON.stringify({result: 0, data: {err: 5, msg: '没有输入邮编'}}));
        if (isNaN(zip) || zip < 100000 || zip > 999999)
            return res.end(JSON.stringify({result: 0, data: {err: 6, msg: '邮编不是有效数字'}}));
        if (!tel && !mobile)
            return res.end(JSON.stringify({result: 0, data: {err: 7, msg: '电话和手机至少需要填一项！'}}));
    	var newUser = new User({
    		email: email,
    		nickname: nickname,
    		password: password,
            address: address,
            zipcode: zip,
            contact: {tel: tel, mobile: mobile}
    	});

    	User.getUser(req.body.email, function(err, user){
    		if (err)
    			return res.end(JSON.stringify({result: 0, data: {err: 8, msg: err}}));
    		if (user)
    			return res.end(JSON.stringify({result: 0, data: {err: 9, msg: "邮箱已存在"}}));
    		newUser.save(function(err, user) {
    			if (err)
    				return res.end(JSON.stringify({result: 0, data: {err: 10, msg: err}}));
    			req.session.user = user;
                //console.log(user);
    			return res.end(JSON.stringify({result:1, data: {msg:"注册成功！"}}), 'utf8');
    		});
    	});
    });

    app.get('/reg', function(req, res) {
    	res.render('reg_test', {});
    });

    app.get('/login', function(req, res){
    	res.render('login_test', {});
    });

    app.post('/login', function(req, res){
    	res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.body.password)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入密码'}}));
        var email = req.body.email,
            password = require('crypto').createHash('md5').update(req.body.password).digest('hex');
        if (!email)
            return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '没有输入email'}}));
        User.checkLegal(email, password, function(err, user){
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 3, msg: '网络连接有误'}}));
            if (!user)
                return res.end(JSON.stringify({result: 0, data: {err: 4, msg: '用户名或密码不正确'}}));
            req.session.user = user;
            return res.end(JSON.stringify({result: 1, data: {msg: '用户名密码正确'}}));
        });
    });

    app.get('/logout', function(req, res){
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        req.session.user = null;
        return res.end(JSON.stringify({result: 1, data: {msg: '登出成功'}}));
    });

    app.get('/check/email/:email', function(req, res){
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.params.email)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '未输入email地址'}}));
        User.getUser(req.params.email, function(err, user){
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 2, msg: err}}));
            if (user)
                return res.end(JSON.stringify({result: 0, data: {err: 3, msg: '重复的email'}}));
            return res.end(JSON.stringify({result: 1, data: {msg: '可用的email'}}));
        });
    });

    app.get('/upload/picture', function(req, res){
        res.render('upload');
    });

    app.post('/upload/picture', function(req, res){
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        var sts = [];
        for (var i in req.files) {
            var file = req.files[i];
            var obj = file_service.saveFile(file, req.session.user.uid);
            sts.push(obj);
        }
        res.end(JSON.stringify(sts));
    });

    app.post('/create/book', function(req, res){
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.body.bookname)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入书名'}}));
        if (!req.body.pages)
            return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '没有输入页数'}}));
        if (isNaN(parseInt(req.body.pages)))
            return res.end(JSON.stringify({result: 0, data: {err: 3, msg: '页数输入不合法'}}));
        if (!req.body.price)
            return res.end(JSON.stringify({result: 0, data: {err: 4, msg: '没有输入价格'}}));
        if (isNaN(parseFloat(req.body.price)))
            return res.end(JSON.stringify({result: 0, data: {err: 5, msg: '价格输入不合法'}}));
        if (!req.body.brief)
            return res.end(JSON.stringify({result: 0, data: {err: 6, msg: '没有输入简介'}}));
        var newBook = new Book({
            owner: req.session.user.uid,
            isbn: req.body.isbn,
            bookname: req.body.bookname,
            author: req.body.author,
            publishDate: parseInt(req.body.publishDate),//前台传过来的应该是从1970年1月1日起过的毫秒值
            pages: parseInt(req.body.pages),
            price: parseFloat(req.body.price),
            brief: req.body.brief,
            borrowable: parseInt(req.body.borrowable) == 1,//1则true/愿意借,false不愿意借
            pics: JSON.parse(req.body.pics)//必须是一个JSON.stringify过的数组，即使是空的
        });

        newBook.save(function(err, book){
            if(err)
                return res.end(JSON.stringify({result: 0, data: {err: 11, msg: err}}));
            return res.end(JSON.stringify({result: 1, data: {book: book}}));
        });

    });

    //For test only
    app.get('/test/newbook', function(req, res){
        res.render('testbook');
    });
    
    app.get('/get/book', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        var bid = req.query.bid;
        if (!bid)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入Book ID'}}));
        bid = parseInt(bid);
        if (isNaN(bid))
            return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '输入Book ID不是有效id'}}));
        Book.getBook(bid, function(err, book) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 3, msg: '连接错误'}}));
            if (!book)
                return res.end(JSON.stringify({result: 0, data: {err: 4, msg: '没有查找到该图书'}}));
            return res.end(JSON.stringify({result: 1, data: {book: book}}));
        });
    });

    app.get('/get/allmybook', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        Book.getAllBooksOfOwner(req.session.user.uid, function(err, docs) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '连接出现错误'}}));
            return res.end(JSON.stringify({result: 1, data: {books: docs}}));
        });
    });

    app.post('/modify/book', function(req, res){
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        if (!req.body.bookname)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入书名'}}));
        if (!req.body.pages)
            return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '没有输入页数'}}));
        if (isNaN(parseInt(req.body.pages)))
            return res.end(JSON.stringify({result: 0, data: {err: 3, msg: '页数输入不合法'}}));
        if (!req.body.price)
            return res.end(JSON.stringify({result: 0, data: {err: 4, msg: '没有输入价格'}}));
        if (isNaN(parseFloat(req.body.price)))
            return res.end(JSON.stringify({result: 0, data: {err: 5, msg: '价格输入不合法'}}));
        if (!req.body.brief)
            return res.end(JSON.stringify({result: 0, data: {err: 6, msg: '没有输入简介'}}));
        if (!req.body.bid)
            return res.end(JSON.stringify({result: 0, data: {err: 7, msg: '没有传入书的ID'}}));
        var bid = parseInt(req.body.bid);
        //书借出去以后是不允许修改的
        Book.getBook(bid, function(err, bk) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 8, msg: '连接错误'}}));
            if (!bk)
                return res.end(JSON.stringify({result: 0, data: {err: 9, msg: '该图书不存在！'}}));
            if (!bk.available)
                return res.end(JSON.stringify({result: 0, data: {err: 10, msg: '书已借出，不能修改！'}}));

            var book = {
                isbn: req.body.isbn,
                bookname: req.body.bookname,
                author: req.body.author,
                publishDate: parseInt(req.body.publishDate),//前台传过来的应该是从1970年1月1日起过的毫秒值
                pages: parseInt(req.body.pages),
                price: parseFloat(req.body.price),
                brief: req.body.brief,
                borrowable: parseInt(req.body.borrowable) == 1,//1则true/愿意借,false不愿意借
                pics: JSON.parse(req.body.pics)//必须是一个JSON.stringify过的数组，即使是空的
            };
            Book.modifyBook(bid, book, function(err, flag){
                if (err)
                    return res.end(JSON.stringify({result: 0, data: {err: 11, msg: '连接错误'}}));
                if (flag == 0)
                    return res.end(JSON.stringify({result: 0, data: {err: 12, msg: '修改失败'}}));
                return res.end(JSON.stringify({result: 1, data: {book: updated_book}}));
            });
        });
    });

    //app.get('/remove/book', function(req, res){
        
    //});
    
    //创建订单
    //需要参数: bid  
    app.post('/order/create', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        var bid = req.body.bid;
        if(!bid)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有图书号参数'}}));
        if (isNaN(bid))
            return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '图书号参数不正确'}}));
        bid = parseInt(bid);
        Book.checkExistAndOwner(bid, function(err, obj){
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 3, msg: '连接错误'}}));
            if (!obj.exist)
                return res.end(JSON.stringify({result: 0, data: {err: 4, msg: '该图书根本就不存在嘛'}}));
            var oid = obj.oid;
            if (oid == req.session.user.uid)
                return res.end(JSON.stringify({result: 0, data: {err: 5, msg: '你疯啦！自己借自己的书'}}));
            if (!obj.be)
                return res.end(JSON.stringify({result: 0, data: {err: 6, msg: '这本书已设置了不允许外借'}}));
            if (!obj.ae)
                return res.end(JSON.stringify({result: 0, data: {err: 7, msg: '这本书已出借'}}));

            Transaction.checkDupOrder(req.session.user.uid, bid, function(err, flag) {
                if (err)
                    return res.end(JSON.stringify({result: 0, data: {err: 10, msg: '连接问题'}}));
                if (flag)
                    return res.end(JSON.stringify({result: 0, data: {err: 11, msg: '请不要重复下订单！'}}));

                var order = {
                    borrower: req.session.user.uid,
                    bid: bid
                };
                var tran = new Transaction(order);
                tran.save(function(err, transaction) {
                    if (err)
                        return res.end(JSON.stringify({result: 0, data: {err: 8, msg: '该图书根本就不存在嘛'}}));
                    if (!transaction)
                        return res.end(JSON.stringify({result: 0, data: {err: 9, msg: '该订单未成功生成，请重试'}}));
                    return res.end(JSON.stringify({result: 1, data: {transaction: transaction}}));
                });
            });
        });
    });

    app.get('/order/get', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');

        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        if (!req.query.tid)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入订单号'}}));
        var tid = parseInt(req.query.tid);
        if (isNaN(tid))
            return res.end(JSON.stringify({result: 0, data: {err: 31, msg: '订单号不合法'}}));
        Transaction.getTransactionByTid(tid, function(err, tran) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '连接出现问题'}}));
            return res.end(JSON.stringify({result: 1, data: {transaction: tran}}));
        });
        
    });
    
    //订单要得到lender，即出借这本书的人的确认
    //参数1:订单号
    app.get('/order/confirm', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        //判断是否登录
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        if (!req.query.tid)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入订单号'}}));
        var tid = parseInt(req.query.tid);
        if (isNaN(tid))
            return res.end(JSON.stringify({result: 0, data: {err: 31, msg: '订单号不合法'}}));
        Transaction.ConfirmTransaction(req.session.user.uid, tid, function(err, flag) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: err}));
            Transaction.getTransactionByTid(tid, function(err, tran) {
                if (err)
                    return res.end(JSON.stringify({result: 0, data: {err: 32, msg: '连接错误'}}));
                return res.end(JSON.stringify({result: 1, data: {transaction: tran}}));
            });
        });
    });

    //图书拥有者不愿意接受这个订单
    app.get('/order/refuse', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        if (!req.query.tid)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入订单号'}}));
        var tid = parseInt(req.query.tid);
        if (isNaN(tid))
            return res.end(JSON.stringify({result: 0, data: {err: 31, msg: '订单号不合法'}}));
        Transaction.refuseTransaction(req.session.user.uid, tid, function(err, tran) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: err}));
            return res.end(JSON.stringify({result: 1, data: {transaction: tran}}));
        });
    });

    app.get('/order/cancel', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        if (!req.query.tid)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入订单号'}}));
        var tid = parseInt(req.query.tid);
        if (isNaN(tid))
            return res.end(JSON.stringify({result: 0, data: {err: 31, msg: '订单号不合法'}}));

        Transaction.cancelTransaction(req.session.user.uid, tid, function(err, tran) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: err}));
            return res.end(JSON.stringify({result: 1, data: {transaction: tran}}));
        });
    });

    //还书，其实只是拥有者拿回书后拥有者确认
    app.get('/order/return', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        if (!req.query.tid)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入订单号'}}));
        var tid = parseInt(req.query.tid);
        if (isNaN(tid))
            return res.end(JSON.stringify({result: 0, data: {err: 31, msg: '订单号不合法'}}));
        Transaction.returnBook(req.session.user.uid, tid, function(err, tran) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: err}));
             return res.end(JSON.stringify({result: 1, data: {transaction: tran}}));
        });
    });

    app.post('/order/owner_comment', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        if (!req.body.tid)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入订单号'}}));
        var tid = parseInt(req.body.tid);
        if (isNaN(tid))
            return res.end(JSON.stringify({result: 0, data: {err: 41, msg: '订单号不合法'}}));
        var comment = req.body.comment;
        if (!comment)
            return res.end(JSON.stringify({result: 0, data: {err: 42, msg: '没有输入评论'}}));
        Transaction.OwnerComment(req.session.user.uid, tid, comment, function(err, tran) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: err}));
            return res.end(JSON.stringify({result: 1, data: {transaction: tran}}));
        });
    });

    app.post('/order/reader_comment', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        if (!req.body.tid)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入订单号'}}));
        var tid = parseInt(req.body.tid);
        if (isNaN(tid))
            return res.end(JSON.stringify({result: 0, data: {err: 41, msg: '订单号不合法'}}));
        var comment = req.body.comment;
        if (!comment)
            return res.end(JSON.stringify({result: 0, data: {err: 42, msg: '没有输入评论'}}));
        Transaction.ReaderComment(req.session.user.uid, tid, comment, function(err, tran) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: err}));
            return res.end(JSON.stringify({result: 1, data: {transaction: tran}}));
        });
    });

    //别人借我的书
    app.get('/order/reader', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        Transaction.borrowFromMe(req.session.user.uid, function(err, docs) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: err}));
            return res.end(JSON.stringify({result: 1, data: {trans: docs}}));
        });
    });

    //我借别人的书
    app.get('/order/sender', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.session.user)
            return res.end(JSON.stringify({result: 0, data: {err: 0, msg: '用户没有登录'}}));
        Transaction.borrowToMe(req.session.user.uid, function(err, docs) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: err}));
            return res.end(JSON.stringify({result: 1, data: {trans: docs}}));
        });
    });

    app.get('/search', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        if (!req.query.key || req.query.key == "")
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '请输入关键词'}}));
        Book.searchBook(req.query.key, function(err, docs) {
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '连接错误'}}));
            return res.end(JSON.stringify({result: 1, data: {books: docs}}));
        });
    });
};