var User = require('../models/user');
var file_service = require('../services/file_service')

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
    		password = require('crypto').createHash('md5').update(req.body.password).digest('hex');
        if (!email)
            return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '没有输入email'}}));
        if (!nickname)
            return res.end(JSON.stringify({result: 0, data: {err: 3, msg: '没有输入nickname'}}));
    	var newUser = new User({
    		email: email,
    		nickname: nickname,
    		password: password
    	});

    	User.getUser(req.body.email, function(err, user){
    		if (err)
    			return res.end(JSON.stringify({result: 0, data: {err: 4, msg: err}}));
    		if (user)
    			return res.end(JSON.stringify({result: 0, data: {err: 5, msg: "邮箱已存在"}}));
    		newUser.save(function(err, user) {
    			if (err)
    				return res.end(JSON.stringify({result: 0, data: {err: 6, msg: err}}));
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
        if (!req.body.name)
            return res.end(JSON.stringify({result: 0, data: {err: 1, msg: '没有输入书名'}}));
        if (!req.body.pages)
            return res.end(JSON.stringify({result: 0, data: {err: 2, msg: '没有输入页数'}}));
        if (isNaN(parseInt(req.body.pages)))
            return res.end(JSON.stringify({result: 0, data: {err: 3, msg: '页数输入不合法'}}));
        if (!req.body.price)
            return res.end(JSON.stringify({result: 0, data: {err: 4, msg: '没有输入价格'}}));
        if (isNaN(parseInt(req.body.price)))
            return res.end(JSON.stringify({result: 0, data: {err: 5, msg: '价格输入不合法'}}));
        if (!req.body.brief)
            return res.end(JSON.stringify({result: 0, data: {err: 6, msg: '没有输入简介'}}));
    });
};