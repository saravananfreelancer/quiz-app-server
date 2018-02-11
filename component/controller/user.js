var config = require("../../config/config")
	userModel = require("../model/user"),
	quizModel = require("../model/quiz"),
	userController = {},
	_this = this;

userController.checkUser = function(req,reply) {
	userModel.checkUser(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":err.msg});
		} else {
			return reply({"status":200,"message":"Device registered successfully",userDetails:succ})
		}
	})
}

userController.userDetails = function(req,reply) {
	userModel.userDetails(req.params,function(err,succ,token) {
		if(err) {
			return reply({"status":400,"message":err});
		} else {
			quizModel.nextQuiz(function(err,quizRes) {
				if(err){
					return reply({"status":200,userDetails:succ,"token":token});
				} else {
					return reply({"status":200,userDetails:succ,"quizDetails":quizRes,"token":token})
				}
			})
		}
	})
}

userController.listOfUser = function(req,reply) {
	userModel.listOfUser(function(err,succ) {
		if(err) {
			return reply({"status":400,"message":err});
		} else {
			return reply({"status":200,"userList":succ});
		}
	})
}
userController.blockUser = function(req,reply) {
	userModel.blockUser(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":err});
		} else {
			return reply({"status":200,"message":succ});
		}
	})
}
userController.login = function(req,reply) {
	userModel.login(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":succ});
		} else {
			return reply({"status":200,"message":succ});
		}
	})
}
userController.createAdmin = function(req,reply) {
	userModel.createAdmin(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":succ});
		} else {
			return reply({"status":200,"message":succ});
		}
	})
}
userController.changePassword = function(req,reply) {
	userModel.changePassword(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":succ});
		} else {
			return reply({"status":200,"message":succ});
		}
	})
}


module.exports = userController;
