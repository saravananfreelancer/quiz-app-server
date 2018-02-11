var db = require("../../db/db.js");
var _ = require("underscore");
const uuidV1 = require('uuid/v1');
var async = require('async');
var moment = require('moment');
var quizModule = {};


quizModule.nextQuiz = function(cb) {
	//console.log(request);
	db.query("SELECT quizOn,price FROM `quizquestion` where quizOn > CURRENT_TIMESTAMP GROUP by `quizOn` ORDER by `quizOn` ASC LIMIT 3",function(err,res){
		if(!err){
			if(res.length > 0){
				cb(null,res)
			} else {
				cb(true,null)
			}
		} else {
			cb(true,null)
		}
	});
}
quizModule.socketSession = function(data,cb) {
	db.query("insert into quizsession(userId,token,socket) values('"+data.facebookId+"','"+data.token+"','"+data.socketId+"')",function(err,res){
		if(!err){
			cb(null,true)
		}
	})
}
quizModule.deleteSocketSession = function(data,cb) {
	db.query("delete from quizsession where socket='"+data+"'",function() {
		cb(null,true)
	})
}
quizModule.quizQuestion = function(cb) {
	db.query("SELECT * FROM `quizquestion` WHERE `quizOn` > CURRENT_TIMESTAMP ORDER by quizOn ASC LIMIT 2",function(err,res) {
			if(!err && res.length > 0){
				var questionList = [];
				_.each(res,function(ques){
						questionList.push({
							"question":ques.quizQuestion,
							"option":JSON.parse(ques.quizOption),
							"answer":ques.quizAnswer
						})
				})
				cb(null,questionList)
			}
	})
}
quizModule.getWinerList = function(data,cb) {
	var queryString  = "SELECT * FROM `userdetails` WHERE ";
	_.each(data,function(socID,index) {
			var isLast = index == (data.length -1)? "":" || "
			queryString += "facebookId='" +socID+ "'" + isLast;
	})
	db.query(queryString,function(err,res){
			if(!err){
				cb(null,res)
			}
	})
	//console.log(queryString);
}

quizModule.getQuestion = function(data,cb) {
	var isAll = data.questionId == "all"?true:false;
	var sqlQuery = "SELECT * FROM `quizquestion` WHERE `quizOn` > CURRENT_TIMESTAMP ORDER by quizOn ASC";
	if(isAll){
		sqlQuery = "SELECT * FROM `quizquestion` WHERE `quizOn` > CURRENT_TIMESTAMP ORDER by quizOn ASC"
	} else {
		sqlQuery = "SELECT * FROM `quizquestion` WHERE `quizOn` > CURRENT_TIMESTAMP and quizQuestionId = '" + data.questionId + "' ORDER by quizOn ASC"
	}
	db.query(sqlQuery,function(err,res){
			if(!err){
				if(res.length > 0){
						var questionList = {};
						_.each(res,function(question) {
							  var pushData = {
									"description":question.quizQuestion,
									"value":question.quizAnswer,
									"options":JSON.parse(question.quizOption)
								}
								if(!questionList[question.quizQuestionId]) {
									questionList[question.quizQuestionId] = {};
									questionList[question.quizQuestionId].questionId = question.quizQuestionId;
									questionList[question.quizQuestionId].question = [pushData];
									questionList[question.quizQuestionId].Testdetails = {
											"time":question.quizOn,
											"price":question.price,
											"title":question.quizTitle,
									}
								} else {
									questionList[question.quizQuestionId].question.push(pushData);
								}
						})
						questionList = _.values(questionList)
						cb(null,isAll?questionList:questionList[0])
				} else {
					 cb(true,"No record Found")
				}

			}  else {
				cb(true,"DB error")
			}
	});
}
quizModule.createQuestion = function(data,cb,isFromUpdate) {
	var quizQuestionId =  isFromUpdate?data.quiz.quizId:uuidV1(),
			price = data.quiz.price,
			title = data.quiz.title,
			quizOn = moment(data.quiz.quizOn).format("YYYY-MM-DD HH:mm:ss"),
			createdBy = data.quiz.createdBy,
			sqlQuery = "INSERT INTO `quizquestion`(`quizQuestionId`, `quizTitle`, `quizQuestion`, `quizOption`, `quizAnswer`, `quizOn`, `price`, `conductedBy`) VALUES ";
			_.each(data.quiz.question,function(question,i){
					var isLast = i == (data.quiz.question.length - 1) ? "" :","
					sqlQuery += "('"+quizQuestionId+"','"+title+"','"+question.description+"','"+JSON.stringify(question.option)+"','"+question.value+"','"+quizOn+"','"+price+"','"+createdBy+"')" + isLast;
			});
			db.query(sqlQuery,function(err,res){
					if(!err){
						cb(null,"Success")
					} else {
						cb(true,"Insert failed")
					}
		});
}
quizModule.updateQuestion = function(data,cb) {
		db.query("delete from quizquestion where quizQuestionId = '" + data.quiz.quizId + "'",function(err,res){
				if(!err){
					quizModule.createQuestion(data,cb,true)
				} else {
					cb(true,"delete failed")
				}
		});

}
quizModule.request = function(data,cb) {
	var sq = "INSERT INTO `payment`(`userId`, `withDrawType`, `email`, `phone`, `createOn`, `amount`) VALUES ('"+data.userId+"','"+data.withDrawType+"','"+data.email+"','"+data.phone+"','"+moment().format("YYYY-MM-DD HH:mm:ss")+"','"+data.amount+"')";
		db.query(sq,function(err,res){
				if(!err){
					cb(null,"success")
				} else {
					cb(true,"Insert failed")
				}
		});
}
quizModule.paymentList = function(data,cb) {
	var sq = "select * from `payment`";
		db.query(sq,function(err,res){
				if(!err){
					cb(null,res)
				} else {
					cb(true,"get failed")
				}
		});
}


module.exports = quizModule;
