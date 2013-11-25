
var user_service = require('../services/user_service');

function User(user) {
	this.uid;
    this.email = user.email;
    this.password = user.password;
    this.nickname = user.nickname;
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