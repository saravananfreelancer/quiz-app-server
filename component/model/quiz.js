var db = require("../../db/db.js");
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
module.exports = quizModule;