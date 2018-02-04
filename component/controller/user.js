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
	userModel.userDetails(req.params,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":err});	
		} else {			
			quizModel.nextQuiz(function(err,quizRes) {
				if(err){
					return reply({"status":200,userDetails:succ});
				} else {
					return reply({"status":200,userDetails:succ,"quizDetails":quizRes})
				}
			})
		}
	})
}


module.exports = userController;