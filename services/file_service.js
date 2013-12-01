var file_service = exports;
//var mongodb = require('../models/db');
var fs = require('fs');
var settings = require('../settings');

file_service.saveFile = function(file, uid) {
	var namearr = file.name.split('.');
	var ext = namearr[namearr.length - 1].toLowerCase();
	if (file.size == 0) {
		fs.unlinkSync(file.path);
		return {result: 0, data: {err: 1, msg: '空文件'}};
	}
	else if(ext == 'jpg' || ext == 'png' || ext == 'bmp' || ext == 'gif'){
		var date = (new Date()).getTime();
		var str = uid.toString() + date.toString();
		var rename = require('crypto').createHash('md5').update(str).digest('hex');
		var target_path = settings.pic_dir + rename + '.' + ext;
		var accesible_pic = settings.accessible_pic_dir + rename + '.' + ext;
		fs.renameSync(file.path, target_path);
		return {result: 1, data: {pic: accesible_pic}};
	}
	else {
		fs.unlinkSync(file.path);
		return {result: 0, data: {err: 2, msg: '不是图片文件'}};
	}
};