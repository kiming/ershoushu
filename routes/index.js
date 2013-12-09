var User = require('../models/user');
var Book = require('../models/book');
var file_service = require('../services/file_service');

module.exports = function(app) {
    app.get('/', function(req, res){
        res.render('index.ejs', {
            title: "跑起来了吧"
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
        req.session.user = null;
        return res.redirect('/login');
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

    app.post('/modify/book', function(req, res){
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
        if (!req.body.bid)
            return res.end(JSON.stringify({result: 0, data: {err: 7, msg: '没有传入书的ID'}}));
        var bid = parseInt(req.body.bid);
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
        Book.modifyBook(bid, book, function(err, book){
            if (err)
                return res.end(JSON.stringify({result: 0, data: {err: 11, msg: '连接错误'}}));
            if (!book)
                return res.end(JSON.stringify({result: 0, data: {err: 12, msg: '该图书不存在！'}}));
            return res.end(JSON.stringify({result: 1, data: {book: book}}));
        });
    });
    
    //创建订单
    app.post('/create/order', function(req, res) {
        res.setHeader('Content-Type', 'text/JSON;charset=UTF-8');
        
    });

    

};