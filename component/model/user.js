var db = require("../../db/db.js");
const uuidV1 = require('uuid/v1');
const moment = require('moment');
var ShortUniqueId = require('short-unique-id');
var rid = new ShortUniqueId();
var userModule = {};


userModule.checkUser = function(request,cb) {
	//console.log(request);
	db.query("select * from userdetails where facebookId = '" + request.userId + "'",function(err,res){
		if(!err){
			if(res.length > 0){
				cb(null,res[0])
			} else {
				userModule.createUser(request,cb);
			}
		} else {
			cb(true,null)
		}
	});
}
userModule.userDetails = function(request,cb) {
	console.log(request);
	db.query("select * from userdetails where facebookId = '" + request.userId + "'",function(err,res){
		if(!err){
			console.log(res);
			if(res.length > 0){
				cb(null,res[0])
			} else {
				cb(true,null)
			}
		} else {
			cb(true,null)
		}
	});
}

userModule.createUser = function(payload,cb) {

	var userName = payload.name,
		facebookId = payload.userId,
		UUID = uuidV1(),
		email = payload.email,
		referralBy = "",
		referralCode = rid.randomUUID(13),
		creditCount = 0,
		image =payload.thumbnail;
	db.query("INSERT INTO `userdetails`(`Username`, `facebookId`, `UUID`, `email`, `referralBy`, `referralCode`, `creditCount`,`image`) VALUES ('"+userName+"','"+facebookId+"','"+UUID+"','"+email+"','"+referralBy+"','"+referralCode+"','"+creditCount+"','"+image+"')",function(err,res){
		if(!err){
			db.query("select * from userdetails where facebookId = '" + facebookId + "'",function(err,res){
				if(!err){
					if(res.length > 0){
						cb(null,res[0])
					} else {
						cb(null,{"Username":userName,facebookId:facebookId,UUID:UUID,email:email,referralBy:referralBy,referralCode:referralCode,"creditCount":creditCount,"image":image})
					}
				} else {
					cb(null,{"Username":userName,facebookId:facebookId,UUID:UUID,email:email,referralBy:referralBy,referralCode:referralCode,"creditCount":creditCount,"image":image})
				}
			});
		} else {
			cb(true,null)
		}
	});
}
module.exports = userModule;
