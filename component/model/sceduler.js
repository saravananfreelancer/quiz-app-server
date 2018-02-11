var db = require("../../db/db.js");
var _ = require("underscore");
const uuidV1 = require('uuid/v1');
var async = require('async');
var moment = require('moment');
var quizScedule = {};
var socketComponent = require("../socket/index.js");

quizScedule.callQuiz = function() {
		var sql ="SELECT * FROM `quizquestion` WHERE `quizOn` > CURRENT_TIMESTAMP GROUP by quizOn";
		db.query(sql,function(err,res){
				if(!err){
					//cb(null,res)
				  var timeList = [moment().add(20,"seconds").format("YYYY-MM-DD HH:mm:ss")];
					_.each(res,function(qus){
						timeList.push(moment(qus.quizOn).format("YYYY-MM-DD HH:mm:ss"))
					})
					socketComponent.scheduleJobEvents(timeList);
				}
		});
}

module.exports = quizScedule;
