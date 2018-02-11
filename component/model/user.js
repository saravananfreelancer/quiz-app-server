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
	db.query("select * from userdetails where facebookId = '" + request.userId + "'",function(err,res){
		if(!err){
			if(res.length > 0){
				userModule.token(res[0],cb)
			} else {
				cb(true,null)
			}
		} else {
			cb(true,null)
		}
	});
}
userModule.token = function(userRecord,cb){
			var userToken = uuidV1();
			db.query("insert into session(userId,token) values('"+userRecord.facebookId+"','"+userToken+"')",function(err,res){
				if(!err){
					cb(null,userRecord,userToken)
				}
			})
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
userModule.listOfUser = function(cb){
		var sqlQuery = "select * from  userdetails";
		db.query(sqlQuery,function(err,res){
				if(!err) {
					cb(null,res)
				} else {
					cb(true,null)
				}
		})
}
userModule.blockUser = function(req,cb){
		var sqlQuery = "update userdetails set isBlock =" +req.isBlock + " where id = '"+req.userId+"'";
		console.log(sqlQuery)
		db.query(sqlQuery,function(err,res){
				if(!err) {
					cb(null,"success")
				} else {
					cb(true,null)
				}
		})
}
userModule.login = function(req,cb){
		var sqlQuery = "select * from admindetails where userName = '"+req.userName+"' and password = MD5('"+req.password+"')";
		//console.log(sqlQuery)
		db.query(sqlQuery,function(err,res){
				if(!err) {
					if(res.length > 0){
						var userToken = uuidV1();
						db.query("insert into session(userId,token,isAdmin) values('"+res[0].id+"','"+userToken+"','true')",function(err,res){
							if(!err){
								cb(null,{token:userToken});
							} else {
								cb(true,"failed")
							}
						})
					} else {
						cb(true,"failed")
					}
				} else {
					cb(true,"DB failed")
				}
		})
}

userModule.createAdmin = function(req,cb){
		var userCheck = "select * from admindetails where userName = '"+req.userName+"'";
		db.query(userCheck,function(err,res){
				if(!err) {
					if(res.length == 0){
						var sqlQuery = "insert into admindetails(userName,password) values('" +req.userName+ "',MD5('"+req.password+"'))";
						//console.log(sqlQuery)
						db.query(sqlQuery,function(err,res){
								if(!err) {
									cb(true,"success")
								} else {
									cb(true,"DB failed")
								}
						})
					} else {
						cb(true,"User already in DB")
					}
				} else {
					cb(true,"DB failed")
				}
		})

}

userModule.changePassword = function(req,cb){
	var sqlQuery = "select * from admindetails where userName = '"+req.userName+"' and password = MD5('"+req.oldPassword+"')";
	//console.log(sqlQuery)
	db.query(sqlQuery,function(err,res){
			if(!err) {
				if(res.length > 0){
					var updatePassword = "update admindetails set password = MD5('"+req.password+"') where userName = '"+req.userName+"'"
					db.query(updatePassword,function(err,res){
							if(!err) {
								cb(null,"success")
							} else {
								cb(true,"failed")
							}
				  })
				} else {
					cb(true,"failed")
				}
			} else {
				cb(true,"DB failed")
			}
	})
}
userModule.checkHeader = function(head,cb){
	//console.log(head)
	if(head && head != "" && head.indexOf("bearer ") > -1){
		head = head.split("bearer ");
		var sql ="select * from session where token='"+head[1]+"'";
		db.query(sql,function(err,res){
				if(!err) {
					if(res.length > 0){
						cb(null,{});
					} else {
						cb(true,"failed")
					}
				} else {
					cb(true,"failed")
				}
		})
	} else {
		cb(true,"failed")
	}

}

module.exports = userModule;
