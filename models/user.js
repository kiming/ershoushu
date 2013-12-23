
var user_service = require('../services/user_service');

function User(user) {
	this.uid;
    this.email = user.email;
    this.password = user.password;
    this.nickname = user.nickname;
    this.address = user.address;
    this.zipcode = user.zipcode;//邮编
    this.contact = user.contact;//联系方式，手机/电话,这是一个对象
};

module.exports = User;

User.prototype.save = function(callback) {
	user_service.saveUser(this, callback);
};

User.getUser = function(email, callback) {
	user_service.getUserByEmail(email, callback);
};

User.checkLegal = function(email, password, callback) {
	user_service.getUserByEmailAndPassword(email, password, callback);
};

User.getUserSafe = function(uid, callback) {
    user_service.getUserByUid(uid, callback);
};