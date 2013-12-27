//全局变量
var MyApplication = {
	Constants : { // 常量
	},
	Tpl : { // 模板
		dialog : "<div class='dialog' title='{title}'>{content}</div>",
		formItem : "<div class='formItem {type}'><span class='itemName'>{itemName}</span><input class='input' type='{type}' value='{value}' name='{name}'></div>",
		textareaItem : "<div class='formItem {type}'><span class='itemName'>{itemName}</span><textarea class='textarea' value='{value}' name='{name}'>{value}</textarea>",
		selectItem:"<div class='formItem {type}'><span class='itemName'>{itemName}</span>" +
				"<select name='{name}' class='select'></select></div>",
		optionItem:"<option value ='{trueValue}'>{value}</option>",
		listItem : "<li class='listItem'><span class='itemName'>{itemName}:</span><span class='itemValue'>{itemValue}</span></li>",
		bookItem : "",
		commentsWrapper : "",
		comment : "",
		reply : "",
		article : "",
		myBook : "",
		myBorrow : "",
		message : "" // 在View.prototype.initialize初始化
	},
	TplArgs : { // 模板所需要的参数
		messageDialog : {
			closeText : "关闭",
			width : 300,
			modal : true,
			position : "center",
			resizable : false,
			close : function() {
				$(this).remove();
			}
		}, // JQuery调用所需参数
		iniMessageDialog : function() {
			this.messageDialog = {
				closeText : "关闭",
				width : 300,
				modal : true,
				position : "center",
				resizable : false,
				close : function() {
					$(this).remove();
				}
			};
			return this.messageDialog;
		},
		// LoginForm所包含的的条目
		loginForm : [ {
			itemName : "邮箱",
			name : "email",
			type : "text",
			value : ""
		}, {
			itemName : "密码",
			name : "password",
			type : "password",
			value : ""
		} ],
		// RegisterForm所包含的的条
		registerForm : [ {
			itemName : "邮箱",
			name : "email",
			type : "text",
			value : ""
		}, {
			itemName : "昵称",
			name : "nickname",
			type : "text",
			value : ""
		}, {
			itemName : "手机号码",
			name : "mobile",
			type : "text",
			value : ""
		}, {
			itemName : "地址",
			name : "address",
			type : "hidden",
			value : "default"
		}, {
			itemName : "邮编",
			name : "zipcode",
			type : "hidden",
			value : "111111"
		}, {
			itemName : "电话号码",
			name : "tel",
			type : "hidden",
			value : "111111"
		}, {
			itemName : "密码",
			name : "password",
			type : "password",
			value : ""
		}, {
			itemName : "确认密码",
			name : "password1",
			type : "password",
			value : ""
		} ],
		//uploadBookForm
		uploadBookForm : [ {
			itemName : "书名",
			name : "bookname",
			type : "text",
			value : ""
		}, {
			itemName : "作者",
			name : "author",
			type : "text",
			value : ""
		},{
			itemName : "出版时间",
			name : "publishDate",
			type : "date",
			value : ""
		},{
			itemName : "出版社",
			name : "publisher",
			type : "text",
			value : ""
		},{
			itemName : "ISBN",
			name : "isbn",
			type : "text",
			value : ""
		},{
			itemName : "页数",
			name : "pages",
			type : "text",
			value : ""
		},{
			itemName : "价格",
			name : "price",
			type : "text",
			value : ""
		},{
			itemName : "是否可借",
			name : "borrowable",
			type : "select",
			value : "",
			options:[{trueValue:"1",value:"可借"},{trueValue:"0",value:"不可借"}]
		}, {
			itemName : "简介",
			name : "brief",
			type : "textarea",
			value : ""
		},{
			itemName : "图片",
			name : "pics",
			type : "hidden",
			value : "[]"
		},{
			itemName : "图片",
			name : "pic",
			type : "file",
			value : ""
		} ],
		// orderList
		orderList : [ {
			itemName : "借书人",
			itemValue : ""
		}, {
			itemName : "邮箱",
			itemValue : ""
		}, {
			itemName : "手机",
			itemValue : ""
		}, {
			itemName : "应还时间",
			itemValue : ""
		} ]
	},
	Urls : {
		home : "",
		getMessage : "/message/count",
		getOrder : "/book/news",
		getAllMessages : "/message/getall",
		getMyBooks : "/book/my",
		getMyBorrow : "/book/myborrow",
		uploadBook : "/create/book",
		uploadPic:"/upload/picture",
		getPersonInf : "",
		login : "/login",
		logout : "/logout",
		register : "/reg",
		searchBooks : "/search",
		getOneBook : "/get/book",
		createOrder : "/order/create",
		confirmOrder : "/order/confirm",
		refuseOrder : "/order/refuse",
		canelOrder : "/order/cancel",
		confirmReturn : "/order/return",
		readerComment : "/order/reader_comment",
		ownerComment : "/order/owner_comment",
		showComments:"/book/comment"
	},
	Login : false, // 登陆标示符
	Timeout : null, // 轮询函数指针
	Control : new Control(), // 单一实例，定义全局控制器
	View : new View(), // 单一实例，定义全局表示层
	loading : function() { // 展示loading框
		var loading = $("#loading");
		loading.css("display", function() {
			return loading.css("display") === "none" ? "block" : "none";
		});
		var bak = $(".ui-widget-overlay");
		bak.css("z-index", function() {
			return bak.css("z-index") === "1000" ? "100" : "1000";
		});
	},
	changeLoginState : function() { // 更改全局登录状态
		if (MyApplication.Login === false) {
			MyApplication.Login = true;
			$("#loginOrNot").val("true");
			var topNav = $("#topNav").empty();
			topNav
					.append($("<li class='withHL' id='logout'>退出</li><li class='withHL' id='uploadBook'>上传书籍</li><li class='withHL' id='myHome'>个人中心</li>"));
			$("#myHome").click(function() {
				MyApplication.Control.getPersonInf();
			});
			$("#logout").click(function() {
				MyApplication.Control.logout();
			});
			$("#uploadBook").click(function() {
				MyApplication.View.showBox("uploadBook");
			});
		} else {
			MyApplication.Login = false;
			$("#loginOrNot").val("false");
			var topNav = $("#topNav").empty();
			topNav
					.append($("<li class='withHL' id='registerBut'>注册</li><li class='withHL' id='loginBut'>登陆</li>"));
			$("#loginBut").click(function() {
				MyApplication.View.showBox("login");
			});
			$("#registerBut").click(function() {
				MyApplication.View.showBox("register");
			});
		}
	},
	initializeLoginState : function(){
		if (MyApplication.Login === true) {
			var topNav = $("#topNav").empty();
			topNav.append($("<li class='withHL' id='logout'>退出</li><li class='withHL' id='uploadBook'>上传书籍</li><li class='withHL' id='myHome'>个人中心</li>"));
			$("#myHome").click(function() {
				MyApplication.Control.getPersonInf();
			});
			$("#logout").click(function() {
				MyApplication.Control.logout();
			});
			$("#uploadBook").click(function() {
				MyApplication.View.showBox("uploadBook");
			});
		} else {
			var topNav = $("#topNav").empty();
			topNav.append($("<li class='withHL' id='registerBut'>注册</li><li class='withHL' id='loginBut'>登陆</li>"));
			$("#loginBut").click(function() {
				MyApplication.View.showBox("login");
			});
			$("#registerBut").click(function() {
				MyApplication.View.showBox("register");
			});
		}
	},
	checkInput : function(type, input) { // 验证各种输入
		var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/;
		switch (type) {
		case "email":
			return emailReg.test(input);
			break;
		default:
			return false;
			break;
		}
	}
};

Object.freeze(MyApplication.Constants);// 冻结常量，不可变

// 自定义事件管理对象，其他对象可继承该对象从而实现事件管理
function EventTarget() {
	if (this instanceof EventTarget) {
		this.handlers = {}; // handlers：一个事件类型对应一组事件处理函数，type:[functionA,functionB,functionC..
	} else {
		return new EventTarget();
	}
}

EventTarget.prototype = {
	constructor : EventTarget,
	// 添加事件处理函数
	addHandler : function(type, handler) {
		if (typeof this.handlers[type] == "undefined") {
			this.handlers[type] = [];
		}
		this.handlers[type].push(handler);
	},
	// 触发事件处理函数
	fire : function(event) {
		if (!event.target) {
			event.target = this;
		}
		if (this.handlers[event.type] instanceof Array) {
			var handlers = this.handlers[event.type];
			for ( var i = 0, len = handlers.length; i < len; i++) {
				handlers[i](event);
			}
		}
	},
	// 移除事件处理函数
	removeHandler : function(type, handler) {
		if (this.handlers[type] instanceof Array) {
			var handlers = this.handlers[type];
			for ( var i = 0, len = handlers.length; i < len; i++) {
				if (handlers[i] === handler) {
					break;
				}
			}
			handlers.splice(i, 1);
		}
	}
};

// Request对象，向服务器发出ajax请求
function Request(url, args, callback) {
	if (this instanceof Request) {
		this.url = url;
		this.args = args; // 参数对象，key/value:{a:b,c:d,e:f}
		this.callback = callback; // function,回调函数
	} else {
		return new Request(url, args, callback);
	}
}

Request.prototype.send = function() {
	var ajaxArg = {
		type : "post",
		url : this.url,
		dataType : "json",
		data : this.args,
		success : this.callback
	};
	$.ajax(ajaxArg);
};

Request.prototype.get = function() {
	var ajaxArg = {
			type : "get",
			url : this.url,
			dataType : "json",
			data : this.args,
			success : this.callback
		};
		$.ajax(ajaxArg);
}; 

// Control层，接受用户输入，调用Request或者View层响应用户输出
function Control() {
}
Control.prototype.showBox = function(message) {
	MyApplication.View.genBox(message);
};
Control.prototype.getMessage = function(loop) {// loop,循环。true代表轮询，false发送一次请求
	if (MyApplication.Login === true) {
		var url = MyApplication.Urls.getMessage;
		var data = [];
		var callback = MyApplication.View.getMessage;
		var req = new Request(url, data, callback);
		req.get();
	}
	if (loop === true) {
		MyApplication.Timeout = setTimeout(function() {
			MyApplication.Control.getMessage(true);
		}, 300000);
	}
};
Control.prototype.login = function() {
	var url = MyApplication.Urls.login;
	var data = $("#dialogForm").serializeArray();
	var callback = MyApplication.View.login;
	var req = new Request(url, data, callback);
	req.send();
	MyApplication.loading();
};
Control.prototype.logout = function() {
	var url = MyApplication.Urls.logout;
	var data = [];
	var callback = MyApplication.View.logout;
	var req = new Request(url, data, callback);
	req.send();
	MyApplication.loading();
};
Control.prototype.register = function() {
	var url = MyApplication.Urls.register;
	var data = $("#dialogForm").serializeArray();
	var res = MyApplication.Control.checkForm(data);
	if (!res.isOk) {
		$(".err").text(res.msg);
		return;
	}
	var callback = MyApplication.View.register;
	var req = new Request(url, data, callback);
	req.send();
	MyApplication.loading();
};
Control.prototype.uploadBook = function(){
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.uploadBook;
		var data = $("#dialogForm").serializeArray();
		//var res = MyApplication.Control.checkForm(data);
		//if (!res.isOk) {
		//	$(".err").text(res.msg);
		//	return;
		//}		
		var callback = MyApplication.View.uploadBook;
		var req = new Request(url, data, callback);
		req.send();
		MyApplication.loading();
	}
};
Control.prototype.searchBooks = function() {
	var url = MyApplication.Urls.searchBooks;
	var data = [];
	var type = $("#searchMain").css("display") == "none" ? 1 : 0;
	if (type == 0)
		data = $("#search_form").serializeArray(); // 主页的search_form
	else
		data = $("#search_form1").serializeArray(); // 搜索页的search_form
	var callback = MyApplication.View.searchBooks;
	var req = new Request(url, data, callback);
	req.get();
	MyApplication.loading();
};
Control.prototype.showOneBook = function(bookID) {
	var url = MyApplication.Urls.getOneBook;
	var data = [ {
		name : "bid",
		value : bookID
	} ];
	var callback = MyApplication.View.showOneBook;
	var req = new Request(url, data, callback);
	req.get();
	MyApplication.loading();
};
Control.prototype.showComments = function(bookID){
	var url = MyApplication.Urls.showComments ;
	var data = [ {
		name : "bid",
		value : bookID
	} ];
	var callback = MyApplication.View.showComments;
	var req = new Request(url, data, callback);
	req.get();
};
Control.prototype.createOrder = function(bookID) {
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.createOrder;
		var data = [ {
			name : "bid",
			value : bookID
		} ];
		var callback = MyApplication.View.createOrder;
		var req = new Request(url, data, callback);
		req.send();
		MyApplication.loading();
	}
};
Control.prototype.getOrder = function(bookID) {
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.getOrder;
		var data = [ {
			name : "bid",
			value : bookID
		} ];
		var callback = MyApplication.View.getOrder;
		var req = new Request(url, data, callback);
		req.get();
		MyApplication.loading();
	}
};
Control.prototype.confirmOrder = function(orderID) {
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.confirmOrder;
		var data = [ {
			name : "tid",
			value : orderID
		} ];
		var callback = MyApplication.View.confirmOrder;
		var req = new Request(url, data, callback);
		req.send();
		MyApplication.loading();
	}
};
Control.prototype.refuseOrder = function(orderID) {
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.refuseOrder;
		var data = [ {
			name : "tid",
			value : orderID
		} ];
		var callback = MyApplication.View.refuseOrder;
		var req = new Request(url, data, callback);
		req.send();
		MyApplication.loading();
	}
};
Control.prototype.cancelOrder = function(orderID) {
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.cancelOrder;
		var data = [ {
			name : "tid",
			value : orderID
		} ];
		var callback = MyApplication.View.cancelOrder;
		var req = new Request(url, data, callback);
		req.send();
		MyApplication.loading();
	}
};
Control.prototype.confirmReturn = function(orderID) {
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.confirmReturn;
		var data = [ {
			name : "tid",
			value : orderID
		} ];
		var callback = MyApplication.View.confirmReturn;
		var req = new Request(url, data, callback);
		req.send();
		MyApplication.loading();
	}
};
Control.prototype.getPersonInf = function() {
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.getAllMessages;
		var data = [];
		var callback = MyApplication.View.getPersonInf;
		var req = new Request(url, data, callback);
		req.get();
		MyApplication.loading();
	}
};
Control.prototype.getMyBooks = function() {
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.getMyBooks;
		var data = [];
		var callback = MyApplication.View.getMyBooks;
		var req = new Request(url, data, callback);
		req.get();
		MyApplication.loading();
	}
};
Control.prototype.getMyBorrow = function() {
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.getMyBorrow;
		var data = [];
		var callback = MyApplication.View.getMyBorrow;
		var req = new Request(url, data, callback);
		req.get();
		MyApplication.loading();
	}
};
Control.prototype.readerComment = function(){
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.readerComment;
		var data = $("#readerComment").serializeArray();
		var callback = MyApplication.View.comment;
		var req = new Request(url, data, callback);
		req.send();
		MyApplication.loading();
	}
};
Control.prototype.ownerComment = function(){
	if (MyApplication.Control.checkLogin()) {
		var url = MyApplication.Urls.ownerComment;
		var data = $("#ownerComment").serializeArray();
		var callback = MyApplication.View.comment;
		var req = new Request(url, data, callback);
		req.send();
		MyApplication.loading();
	}
};
Control.prototype.uploadPic = function(fileID){
	$.ajaxFileUpload({
		url : MyApplication.Urls.uploadPic,
		secureuri : false,
		fileElementId : fileID,
		dataType : 'json',
		success : function(data,status) {
			if (data[0].result == 1) {
				$("[name='pics']").val("[\""+data[0].data.pic+"\"]");
				MyApplication.Control.uploadBook();
			}else{
				$('.err').html("上传书籍失败!");
			}

		},
		error: function (data, status, e){
			alert(e);
		}
	});
};
Control.prototype.checkForm = function(data) {
	var res = {
		isOk : true,
		msg : ""
	};
	// 初始输入为数组[{name:a,valueb},{},{]]
	for ( var i = 0, len = data.length; i < len; i++) {
		var pair = data[i];
		if (pair.value.length <= 0) {
			res.isOk = false;
			res.msg = "输入信息不完整";
			return res;
		}
		data[pair.name] = pair.value;
	}
	// 更改为对象
	if (data.email) {
		if (!MyApplication.checkInput("email", data.email)) {
			res.isOk = false;
			res.msg = "请输入正确的邮箱";
			return res;
		}
	}
	if (data.password && data.password1) {
		if (data.password != data.password1) {
			res.isOk = false;
			res.msg = "两次密码输入不一致";
			return res;
		}
	}
	return res;
};
Control.prototype.checkLogin = function() {
	if (MyApplication.Login === false) {
		var message = {
			title : "登录提示",
			content : "对不起，您没有登录！",
			isForm : false,
			args : [],
			func : function() {
				MyApplication.View.showBox("login");
			},
			isConfirm : true,
			buttons : [ "登录", "关闭" ]
		};
		MyApplication.View.genBox(message);
		return false;
	} else {
		return true;
	}

};

// View层，用户界面控制
function View() {
}
// 下列函数列表表示各个动作完成后的界面更改，并绑定事件
View.prototype.initialize = function() { // 页面初始化
	MyApplication.Login = $("#loginOrNot").val() === "true" ? true : false;
	MyApplication.initializeLoginState();
	MyApplication.Tpl.bookItem = $("#bookTemplate").html();
	MyApplication.Tpl.article = $("#articleTemplate").html();
	MyApplication.Tpl.comment = $("#commentTemplate").html();
	MyApplication.Tpl.reply = $("#replyTemplate").html();
	MyApplication.Tpl.commentsWrapper = $("#commentsWrapperTemplate").html();
	MyApplication.Tpl.myBook = $("#myBooksTemplate").html();
	MyApplication.Tpl.myBorrow = $("#myBorrowTemplate").html();
	MyApplication.Tpl.message = $("#messagesTemplate").html();
	MyApplication.Timeout = setTimeout(function() {
		MyApplication.Control.getMessage(true);
	}, 300000);	
	$(".index").click(function() {
		MyApplication.View.jump(MyApplication.Urls.home);
	});
	$(".searchBookBut").click(function() {
		MyApplication.Control.searchBooks();
	});
	$("#personInf").tabs();
	$(".display").dataTable({
		"oLanguage" : {
			"sLengthMenu" : "每页显示 _MENU_ 条记录",
			"sZeroRecords" : "抱歉， 没有找到",
			"sInfo" : "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
			"sInfoEmpty" : "没有数据",
			"sInfoFiltered" : "(从 _MAX_ 条数据中检索)",
			"oPaginate" : {
				"sFirst" : "首页",
				"sPrevious" : "前一页",
				"sNext" : "后一页",
				"sLast" : "尾页",
				"sSearch" : "搜索"
			},
			"sZeroRecords" : "没有检索到数据"
		}
	});
	$("[href='#messages']").click(function() {
		MyApplication.Control.getPersonInf();
	});
	$("[href='#myBooks']").click(function() {
		MyApplication.Control.getMyBooks();
	});
	$("[href='#myBorrow']").click(function() {
		MyApplication.Control.getMyBorrow();
	});
};
View.prototype.jump = function(page) {
	window.location.href = page;
};
View.prototype.showBox = function(type, title, content) { // 展示各个box,包括登陆，注册。。。
	var message = {
		title : "",
		content : "",
		isForm : false,
		args : [],
		func : null,
		isConfirm : false
	}; // messageTemplate
	switch (type) {
	case "login":
		message.title = "用户登录";
		if (MyApplication.Login === true) {
			message.content = "对不起，您已经登录！如果该问题一直发生，请刷新页面~~";
		} else {
			message.isForm = true;
			message.args = MyApplication.TplArgs.loginForm;
			message.func = MyApplication.Control.login;
		}
		break;
	case "logout":
		break;
	case "register":
		message.title = "用户注册";
		message.isForm = true;
		message.args = MyApplication.TplArgs.registerForm;
		message.func = MyApplication.Control.register;
		break;
	case "general":
		message.title = title;
		message.content = content;
		break;
	case "uploadBook":
		message.title = "上传书籍";
		message.isForm = true;
		message.args = MyApplication.TplArgs.uploadBookForm;
		message.func = function(){MyApplication.Control.uploadPic("uploadPic");};
		break;
	default:
		break;
	}
	MyApplication.View.genBox(message);
};
View.prototype.login = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		$("#dialogForm").dialog("close");
		MyApplication.changeLoginState();
	} else {
		MyApplication.loading();
		$(".err").text(data.data.msg);
	}
};
View.prototype.logout = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		MyApplication.changeLoginState();
	} else {
		MyApplication.loading();
		MyApplication.View.showBox("general", "用户退出", data.data.msg);
	}
};
View.prototype.uploadBook = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		$("#dialogForm").dialog("close");
		var message = {
			title : "上传书籍",
			content : '上传书籍成功!'
		};
		MyApplication.View.genBox(message);
	} else {
		MyApplication.loading();
		$(".err").text(data.data.msg);
	}
};
View.prototype.register = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		$("#dialogForm").dialog("close");
		MyApplication.changeLoginState();
	} else {
		MyApplication.loading();
		$(".err").text(data.data.msg);
	}
};
View.prototype.searchBooks = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		$("#searchMain").hide();
		$("#mainBar").show();
		$("#sideBar").show();
		$("#searchResult .results").show();
		$("#oneBookDetail").hide();
		$("#personInf").hide();

		var tpl = new Tpl(MyApplication.Tpl.bookItem);
		var books = data.data.books;
		var bookContainer = $("#books");
		bookContainer.empty();
		for ( var i = 0, size = books.length; i < size; i++) {
			var bookObject = books[i];
			var pubDate = new Date(bookObject.publishDate);
			bookObject.publishDate = pubDate.toLocaleDateString();
			var shelfTime = new Date(bookObject.shelfTime);
			bookObject.shelfTime = shelfTime.toLocaleDateString();
			var available = bookObject.available;
			bookObject.available = available === true ? "可借" : "已被借出";
			bookObject.visible = available === true ? "visible" : "hidden";
			var book = tpl.initialize(bookObject);
			bookContainer.append(book);
		}
		$(".bookname").bind("click", function() {
			var bookID = $(this).attr("id");
			MyApplication.Control.showOneBook(bookID);
		});
		// $(".bookname").tooltip();
	} else {
		MyApplication.loading();
		var message = {
			title : "搜索书籍",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.showOneBook = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		$("#searchResult .results").hide();
		var container = $("#oneBookDetail");
		container.empty();
		var tpl = new Tpl(MyApplication.Tpl.article);
		var bookObject = data.data.book;
		var pubDate = new Date(bookObject.publishDate);
		bookObject.publishDate = pubDate.toLocaleDateString();
		var shelfTime = new Date(bookObject.shelfTime);
		bookObject.shelfTime = shelfTime.toLocaleDateString();
		var available = bookObject.available;
		bookObject.available = available === true ? "可借" : "已被借出";
		bookObject.visible = available === true ? "visible" : "hidden";
		var book = tpl.initialize(bookObject);
		container.append(book);
		container.show();
		$("#backToSearchList div:first").bind("click", function() {
			$("#searchResult .results").show();
			$("#oneBookDetail").hide();
			$("#oneBookDetail").empty();
		});
		$("#backToSearchList div:last").bind("click", function() {
			var bookID = $(this).attr("id");
			var message = {
				title : "确认借书",
				content : "请再次点击，确认借书",
				isForm : false,
				args : [],
				func : function() {
					MyApplication.Control.createOrder(bookID);
				},
				isConfirm : true,
				buttons : [ "确认", "关闭" ]
			};
			MyApplication.View.genBox(message);
		});
		MyApplication.Control.showComments(bookObject.bid);
	} else {
		MyApplication.loading();
		var message = {
			title : "获取书籍详细信息",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.showComments = function(data){
	$("#loadingComments").remove();
	var container = $("#comments1 ul:first");
	var commentTpl = new Tpl(MyApplication.Tpl.commentTemplate);
	var replyTpl = new Tpl(MyApplication.Tpl.replyTemplate);
	if (data.result == 1) {
		//{result: 1, data: {owner: {uid: 1, nickname: '阿汤'....}, 
		//pairs: [{reader: {uid: 2, nickname: '啊'， r_comment:'reader评论',o_comment:'owner评论'}}, {...}, ...]}}
		var comments = data.data.pairs;
		var owner = data.owner;
		for(var i=0,size=comments.size();i<size;i++){
			var comment = comments[i].reader;
			comment.username = comment.nickname;
			comment.content = comment.r_comment.content;
			comment.pubTime = (new Date(comment.r_comment.time)).toLocaleDateString();
			comment.avatar = '/image/default.jpg';
			comment.reply = '';
			if(comment.o_comment != null && comment.o_comment.content){
				owner.username = owner.nickname;
				owner.content = comment.o_comment.content;
				owner.pubTime = (new Date(comment.o_comment.time)).toLocaleDateString();
				owner.avatar = '/image/default.jpg';
				comment.reply = replyTpl.initialize(owner);
			}
			container.append($(commentTpl.initialize(comment)));
		}
	} else {
		container.append("<div>"+data.data.msg+"</div>");
	}
};
View.prototype.createOrder = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		var message = {
			title : "借阅书籍",
			content : "已向该书籍拥有者发送借阅请求，请耐心等待！"
		};
		MyApplication.View.genBox(message);
	} else {
		MyApplication.loading();
		var message = {
			title : "借阅书籍",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.confirmOrder = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		var message = {
			title : "借阅书籍",
			content : "已确认借书~谢谢您的慷慨！"
		};
		MyApplication.View.genBox(message);
	} else {
		MyApplication.loading();
		var message = {
			title : "借阅书籍",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.refuseOrder = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
	} else {
		MyApplication.loading();
		var message = {
			title : "借阅书籍",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.cancelOrder = function(data) {

};
View.prototype.confirmReturn = function(data) {

};
View.prototype.getPersonInf = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		$("#mainBar").show();
		$("#sideBar").show();
		$("#searchMain").hide();
		$("#searchResult .results").hide();
		$("#oneBookDetail").hide();
		$("#personInf").show();
		$("#personInf").tabs("option", "active", 0);
		var messages = data.data.messages;
		var table = $('#messages table').dataTable();
		var allRows = table.$("tr");
		for ( var i = 0, size = allRows.length; i < size; i++) {
			table.fnDeleteRow(allRows[i]);
		}
		for ( var i = 0, size = messages.length; i < size; i++) {
			var message = messages[i];
			message.no = i + 1;
			var cTime = new Date(message.cTime);
			message.cTime = cTime.toLocaleDateString();
			var mType = message.mType;
			message.bookName = "《"+message.bookName+"》";
			switch (mType) {
			case 1:
				message.inf = message.fromUserName + "请求借阅您的" + message.bookName;
				message.operate = "<a href='javascript:void(0)' class='confirmOrder' id='"
					+ message.tid + "'>(确认)</a>" + "<a href='javascript:void(0)' class='refuseOrder' id='"
					+ message.tid + "'>(拒绝)</a>";
				break;
			case 2:
				message.inf = message.fromUserName + "拒绝您借阅" + message.bookName;
				message.operate = "";
				break;
			case 3:
				message.inf = message.fromUserName + "同意您借阅" + message.bookName;
				message.operate = "";
				break;
			case 4:
				message.inf = message.fromUserName + "确认您归还了" + message.bookName;
				message.operate = "(<a href='javascript:void(0)' class='readerComment' id='"
					+ message.tid + "'>评论该书籍</a>)";
				break;
			case 5:
				message.inf = message.fromUserName + "评论了您的" + message.bookName;
				message.operate = "(<a href='javascript:void(0)' class='ownerComment' id='"
					+ message.tid + "'>回复该评论</a>)";
				break;
				break;
			case 6:
				message.inf = message.fromUserName + "回复了您对" + message.bookName + "的评论";
				message.operate = "";
				break;
			default:
				break;
			}
			table.fnAddData([ message.no, message.inf, message.cTime,
					message.operate ]);		
		}
		$(".confirmOrder").bind("click",function(){
			var orderID = $(this).attr("id");
			var message = {
					title : "同意借书",
					content : "请再次点击，确认借书",
					isForm : false,
					args : [],
					func : function() {
						MyApplication.Control.confirmOrder(orderID);
					},
					isConfirm : true,
					buttons : [ "确认", "关闭" ]
				};
			MyApplication.View.genBox(message);
		});
		$(".refuseOrder").bind("click",function(){
			var orderID = $(this).attr("id");
			var message = {
					title : "拒绝借书",
					content : "请再次点击，确认拒绝借书",
					isForm : false,
					args : [],
					func : function() {
						MyApplication.Control.refuseOrder(orderID);
					},
					isConfirm : true,
					buttons : [ "确认", "关闭" ]
				};
			MyApplication.View.genBox(message);
		});
		$(".readerComment").bind("click",function(){
			var orderID = $(this).attr("id");
			var content = "<form id='readerComment'><input type='hidden' name='tid' value='"+orderID+"'/>" +
					"<textarea class='commentTextarea' value='' name='content'></textarea></form>";
			var message = {
					title : "发表评论",
					content : content,
					isForm : false,
					func : MyApplication.Control.readerComment,
					isConfirm : true,
					buttons : [ "提交", "关闭" ]
				};
			MyApplication.View.genBox(message);
		});
		$(".ownerComment").bind("click",function(){
			var orderID = $(this).attr("id");
			var content = "<form id='ownerComment'><input type='hidden' name='tid' value='"+orderID+"'/>" +
					"<textarea class='commentTextarea' value='' name='content'></textarea></form>";
			var message = {
					title : "回复该评论",
					content : content,
					isForm : false,
					func : MyApplication.Control.ownerComment,
					isConfirm : true,
					buttons : [ "提交", "关闭" ]
				};
			MyApplication.View.genBox(message);	
		});
	} else {
		MyApplication.loading();
		var message = {
			title : "查看个人中心",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.getMyBooks = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		var books = data.data.books;
		var table = $('#myBooks table').dataTable();
		var allRows = table.$("tr");
		for ( var i = 0, size = allRows.length; i < size; i++) {
			table.fnDeleteRow(allRows[i]);
		}
		for ( var i = 0, size = books.length; i < size; i++) {
			var bookObject = books[i];
			bookObject.no = i + 1;
			var shelfTime = new Date(bookObject.shelfTime);
			bookObject.shelfTime = shelfTime.toLocaleDateString();
			if(bookObject.borrowable){
				var available = bookObject.available;
				bookObject.available = available === true ? "可借" : "已被借出";
			}else{
				bookObject.available = "不可借";
			}	
			bookObject.visible = available === true ? "hidden" : "visible";
			var ava = bookObject.available
					+ "<a href='javascript:void(0)' class='getTra' id='"
					+ bookObject.bid + "' style=\"visibility:"
					+ bookObject.visible + "\">(查看借阅状态)</a>";
			table.fnAddData([ bookObject.no, bookObject.author,
					bookObject.bookname, bookObject.publisher,
					bookObject.shelfTime, ava ]);
		}
		$(".getTra").bind("click", function() {
			var bookID = $(this).attr("id");
			MyApplication.Control.getOrder(bookID);
		});
	} else {
		MyApplication.loading();
		var message = {
			title : "查看所有书籍",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.getMyBorrow = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		var books = data.data.books;
		var table = $('#myBorrow table').dataTable();
		var allRows = table.$("tr");
		for ( var i = 0, size = allRows.length; i < size; i++) {
			table.fnDeleteRow(allRows[i]);
		}
		for ( var i = 0, size = books.length; i < size; i++) {
			var bookObject = books[i];
			bookObject.no = i + 1;
			var endTime = new Date(bookObject.endTime);
			bookObject.endTime = endTime.toLocaleDateString();
			var returnTime = new Date(bookObject.returnTime);
			bookObject.returnTime = returnTime.toLocaleDateString();
			table.fnAddData([ bookObject.no, bookObject.author,
					bookObject.bookname, bookObject.endTime,
					bookObject.returnTime ]);
		}
	} else {
		MyApplication.loading();
		var message = {
			title : "查看借阅书籍",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.getOrder = function(data) {
	if (data.result == 1) {
		MyApplication.loading();
		var order = data.data.transaction;
		var reader = data.data.reader;
		var ul = "<ul class='mylist'>";
		var tpl = new Tpl(MyApplication.Tpl.listItem);
		var endTime = new Date(order.endTime);
		order.endTime = endTime.toLocaleDateString();
		var args = [ {
			itemName : "借书人",
			itemValue : reader.nickname
		}, {
			itemName : "邮箱",
			itemValue : reader.email
		}, {
			itemName : "手机",
			itemValue : reader.mobile
		}, {
			itemName : "应还时间",
			itemValue : order.endTime
		} ];
		for ( var i = 0; i < args.length; i++) {
			var arg = args[i];
			var item = tpl.initialize(arg);
			ul += item;
		}
		ul += "</ul>";
		var message = {
			title : "消息提示",
			content : ul,
			isForm : false,
			func : function() {
				MyApplication.Control.confirmReturn(order.tid);
			},
			isConfirm : true,
			buttons : [ "确认归还", "关闭" ]
		};
		MyApplication.View.genBox(message);
	} else {
		MyApplication.loading();
		var message = {
			title : "查看借阅状态",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.comment = function(data){
	if (data.result == 1) {
		MyApplication.loading();
	} else {
		MyApplication.loading();
		var message = {
			title : "评论",
			content : data.data.msg
		};
		MyApplication.View.genBox(message);
	}
};
View.prototype.genBox = function(message) { // 生成悬浮框
	var messageDialog = MyApplication.TplArgs.iniMessageDialog();
	if (message.isForm === true) {
		var form = $("<form id='dialogForm' title='" + message.title
				+ "'></form>");
		var args = message.args;
		var formItem = new Tpl(MyApplication.Tpl.formItem);
		var textAreaTpl = new Tpl(MyApplication.Tpl.textareaItem);
		var selectTpl = new Tpl(MyApplication.Tpl.selectItem);
		var optionTpl = new Tpl(MyApplication.Tpl.optionItem);
		for ( var i = 0; i < args.length; i++) {
			var arg = args[i];
			if (arg.type == "hidden") {
				arg.itemName = "";
			}
			var item = $(formItem.initialize(arg));
			if(arg.type == "textarea"){
				item = $(textAreaTpl.initialize(arg));
			}else if(arg.type == "select"){
				item = $(selectTpl.initialize(arg));
				var options = arg.options;
				var selectItem = item.children(".select");
				for ( var j = 0; j < options.length; j++) {
					var option = $(optionTpl.initialize(options[j]));
					selectItem.append(option);
				}
			}else if(arg.type == "file"){
				 item.children("input").attr("id","uploadPic");	
			}else if(arg.type == "time"){
				arg.type = 'text';
				item = $(formItem.initialize(arg));
				item.children("input").attr("class","input formTime");	
			}			
			form.append(item);
		}
		$(".formTime").bind("change",function(){
			var that = $(this);

		});
		form.append("<div class='err'></div>");
		messageDialog.buttons = {
			"提交" : message.func,
			"关闭" : function() {
				form.dialog("close");
			}
		};
		messageDialog.width = 300;
		form.dialog(messageDialog);
	} else {
		var tpl = new Tpl(MyApplication.Tpl.dialog);
		var dialog = $(tpl.initialize(message));
		if (message.isConfirm === true) {
			messageDialog.buttons = {};
			messageDialog.buttons[message.buttons[0]] = function() {
				message.func();
				dialog.dialog("close");
			};
			messageDialog.buttons[message.buttons[1]] = function() {
				dialog.dialog("close");
			};
		}
		if (message.position) {
			messageDialog.position = message.position;
		}
		dialog.dialog(messageDialog);
	}
};
View.prototype.getMessage = function(data) {
	if (data.result == 1) {
		var num = data.data.messageCount;
		if(num == 0){
			return;
		}
		var message = {
			title : "消息提示",
			content : "您有" + num + "条消息待处理",
			isForm : false,
			args : [],
			func : MyApplication.Control.getPersonInf,
			func1 : function() {
			},
			isConfirm : true,
			buttons : [ "查看", "忽略" ],
			position : [ 'right', 'bottom' ]
		};
		MyApplication.View.genBox(message);
	}
};

// Template,界面元素模板
function Tpl(tpl) {
	if (this instanceof Tpl) {
		this.tpl = tpl; // tpl ,string值
	} else {
		return new Tpl(tpl);
	}
}
Tpl.prototype.initialize = function(instance) {
	var reg = /\{(\w+)\}/g;
	var text = this.tpl;
	return text.replace(reg, function(match, first_match, pos, originText) {
		return instance[first_match];
	});
};

$(document).ready(View.prototype.initialize);
