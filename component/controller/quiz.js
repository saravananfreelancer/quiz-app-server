var config = require("../../config/config"),
	quizModel = require("../model/quiz"),
	quizController = {},
	_this = this;

quizController.nextQuiz = function(req,reply) {
	quizModel.nextQuiz(function(err,succ) {
		if(err) {
			return reply({"status":400,"message":err.msg});
		} else {
			return reply({"status":200,quizQuestion:succ})
		}
	})
}

quizController.getQuestion = function(req,reply) {
	quizModel.getQuestion(req.params,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":succ});
		} else {
			return reply({"status":200,quizQuestion:succ})
		}
	})
}
quizController.createQuestion = function(req,reply) {
	quizModel.createQuestion(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":succ});
		} else {
			return reply({"status":200,message:succ})
		}
	})
}

quizController.updateQuestion = function(req,reply) {
	quizModel.updateQuestion(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":succ});
		} else {
			return reply({"status":200,message:succ})
		}
	})
}
quizController.request = function(req,reply) {
	quizModel.request(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":succ});
		} else {
			return reply({"status":200,message:succ})
		}
	})
}
quizController.paymentList = function(req,reply) {
	quizModel.paymentList(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":succ});
		} else {
			return reply({"status":200,payment:succ})
		}
	})
}


module.exports = quizController;
