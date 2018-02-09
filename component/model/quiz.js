var db = require("../../db/db.js");
var _ = require("underscore");
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



module.exports = quizModule;
