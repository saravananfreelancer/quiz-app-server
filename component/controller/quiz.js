var config = require("../../config/config"),
	quizModel = require("../model/quiz"),
	quizController = {},
	_this = this;
	
quizController.nextQuiz = function(req,reply) {
	quizModel.nextQuiz(function(err,succ) {
		if(err) {
			return reply({"status":400,"message":err.msg});	
		} else {
			return reply({"status":200,"message":"Device registered successfully",quizQuestion:succ})
		}
	})
}



module.exports = quizController;