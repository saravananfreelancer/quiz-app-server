var moment = require("moment");
var schedule = require('node-schedule');
var quizModel = require("../model/quiz");
var clients = [];
var insertInRoomquiz,insertInReadMode;
var socketComponent = {};
var activeUser = [];
var inActiveUser = [];

socketComponent.scheduleJobEvents = function(quizScheduleTime,configDetails) {
	var configDetails = process.env;
	configDetails.questionTime = Number(configDetails.questionTime);
	configDetails.answerTime = Number(configDetails.answerTime);
	configDetails.breakTime = Number(configDetails.breakTime);
	configDetails.startBefore = Number(configDetails.startBefore);
	console.log(configDetails.startBefore);
    quizScheduleTime.map(function(scheduleTime){
        var cronTime = new Date(moment(scheduleTime,"YYYY-MM-DD HH:mm:ss").format()),
            cronTimeBefore = new Date(moment(scheduleTime,"YYYY-MM-DD HH:mm:ss").subtract(configDetails.startBefore, 'seconds').format());
            //cronTimeBefore = new Date(moment(scheduleTime,"YYYY-MM-DD HH:mm:ss").subtract(configDetails.startBefore, 'minutes').format());
            cronTimefirstQuestionPass= new Date(moment(scheduleTime,"YYYY-MM-DD HH:mm:ss").add(configDetails.questionTime, 'seconds').format());
        schedule.scheduleJob(cronTimeBefore, function(){
            console.log("going to start",this.examTime,this)
							socketComponent.noExam = false;
              socketComponent.quizGoingStart(this.examTime);
        }.bind({"examTime":cronTime}));
        schedule.scheduleJob(cronTime, function(){
							if(!socketComponent.noExam){
								  console.log("start");
								socketComponent.quizStart();
							}
        });
        schedule.scheduleJob(cronTimefirstQuestionPass, function(){
						if(!socketComponent.noExam){
							  console.log("first Question pass")
              socketComponent.firstQuizPass();
						}
        });
    });
}
socketComponent.configSetter = function(){
		var Config = process.env;
		Config.questionTime = Number(Config.questionTime);
		Config.answerTime = Number(Config.answerTime);
		Config.breakTime = Number(Config.breakTime);
		Config.startBefore = Number(Config.startBefore);
		this.gapBetweenQuiz = Number(Config.questionTime) + Number(Config.answerTime) + Number(Config.breakTime) + 2;
		this.config = Config
}
socketComponent.onLoad = function(socket,io,Config) {
		socketComponent.configSetter();
		var _this = this;
    this.socket = socket;
    this.io = io;

    clients.push(socket);
    //console.log(clients);
		socket.emit("getUserDetais")
    socket.on("userDetails",function(userData){
		//console.log("SAdsA");
        socketComponent.userDetails(userData);
				//socketComponent.quizStart();
				//socketComponent.quizGoingStart();
				if(insertInRoomquiz) {
						activeUser.push(_this.socket.userFBId);
		        _this.socket.join("quizEditMode");
		    } else if(insertInReadMode){
						inActiveUser.push(_this.socket.userFBId);
		        _this.socket.join("quizReadMode");
		    }
		    if(_this.quizStarted) {
		        socketComponent.quizStart(true);
		    }
    });
    socket.on("quizResponse",function(data){
        socketComponent.quizResponse(data)
    });
    socket.on('disconnect', function() {
        socketComponent.disconnect()
    });
    //console.log(insertInReadMode)

    //if(clients.length  == 2){
    //    console.log("adasasdasdas")
    //    socketComponent.quizGoingStart();
   // }
}
socketComponent.userDetails = function(data){
		//console.log(this.socket.id)
		data.socketId = this.socket.id;
		this.socket.userFBId = data.facebookId;
		console.log(data.facebookId);
		quizModel.socketSession(data,(err,res)=>{

		})
    //var examTime = moment().add(3,"minutes").format();
    //this.socket.emit("quizTiming",{"quizTime":examTime,"currentTime":moment().format()});
}
socketComponent.quizGoingStart = function(examTime){
		socketComponent.configSetter();
    insertInRoomquiz = true;
		console.log("dasd");
		quizModel.quizQuestion(examTime,(err,res)=>{
				console.log(err,res)
				if(!err) {
					this.questionList = res;
					if(clients.length > 0){
			        clients.map(function(clientDetails){
			            clientDetails.join("quizEditMode");
									activeUser.push(clientDetails.userFBId);
			        });
							console.log(activeUser);
			        if(this.io){
									this.io.in('quizEditMode').emit('quizGoingToStart', {"quizStartIn":this.config.startBefore});
			        }
			    }
				} else {
						this.noExam = true;
				}
		})


    //this.insertInReadMode = true;
    //this.quizStart();
}
socketComponent.questionDetails = function(){
		socketComponent.configSetter();
		/*this.questionList = [{"question":"1","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"2","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"3","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"4","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"5","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"6","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"7","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"8","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"9","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"10","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"11","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
     {"question":"12","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
	 ];*/
    //this.answerList = [1,2,3,3,2,1,1,2,3,2];
    this.questionNo = 0;
    if(this.io) {
        this.io.in('quizEditMode').emit('quizEditMode', this.questionList[0]);
        this.io.in('quizReadMode').emit('quizReadMode', this.questionList[0]);
    }
    socketComponent.questionIteration();
}
socketComponent.quizResponse = function(data){
    //if(this.answerList[this.questionNo] != data.answer){
    if(!data.isAnswerCorrect){
				activeUser.splice(activeUser.indexOf(this.socket.userFBId), 1);
        this.socket.leave('quizEditMode');
				inActiveUser.push(this.socket.userFBId);
        this.socket.join('quizReadMode');
    }
}
socketComponent.sendQuestion = function(){
    this.questionNo += 1;
    //console.log(this.questionNo < (this.questionList.length - 1),this.questionNo,this.questionList.length)
    if(this.questionNo < (this.questionList.length)){
				if(this.io) {
		        this.io.in('quizEditMode').emit('quizEditMode', this.questionList[this.questionNo]);
		        this.io.in('quizReadMode').emit('quizReadMode', this.questionList[this.questionNo]);
		    }
        socketComponent.questionIteration();
    } else {
        insertInReadMode = undefined;
        insertInRoomquiz = undefined;
        socketComponent.quizResult();
    }
}
socketComponent.questionIteration = function(){
    var tenSec=setInterval(function(){startTime()}.bind(this),1000);
    var counter = 0;
    var _this = this;
    function startTime()
    {
          if(counter == _this.gapBetweenQuiz) {
            clearInterval(tenSec);
            socketComponent.sendQuestion();
          } else {
              counter++;
              if(_this.questionNo >= 0 && counter >= Number(_this.config.questionTime)){
                  insertInReadMode = true;
                insertInRoomquiz = false;
              }
              if(_this.io) {
                  if(counter > Number(_this.config.questionTime) && counter <= (Number(_this.config.questionTime) + Number(_this.config.answerTime) + 1)){
                      _this.io.in('quizEditMode').emit('showAnwserTimer', {"question":_this.questionList[_this.questionNo],"mode":"quizEditMode",counterTime:Math.abs((counter) - (Number(_this.config.questionTime) + Number(_this.config.answerTime) + 1)),timer:Number(_this.config.answerTime)});
                      _this.io.in('quizReadMode').emit('showAnwserTimer', {"question":_this.questionList[_this.questionNo],"mode":"quizReadMode",counterTime:Math.abs((counter) - (Number(_this.config.questionTime) + Number(_this.config.answerTime) + 1)),timer:Number(_this.config.answerTime)});
                  } else if(counter > (Number(_this.config.questionTime) + Number(_this.config.answerTime))){
                      _this.io.in('quizEditMode').emit('showTimerBreak', {
											"mode":"quizEditMode",
											"question":_this.questionList[_this.questionNo],
											"counter":Math.abs((counter - (Number(_this.config.questionTime) + Number(_this.config.answerTime) + 2)) - Number(_this.config.breakTime)),
											breakTimer:Number(_this.config.breakTime),
										});
                      _this.io.in('quizReadMode').emit('showTimerBreak', {
												"mode":"quizReadMode",
												"question":_this.questionList[_this.questionNo],
												"counter":counter - (Number(_this.config.questionTime) + Number(_this.config.answerTime) + 2),
												breakTimer:Number(_this.config.breakTime)});
                  } else {
                      _this.io.in('quizEditMode').emit('timer', {"question":_this.questionList[_this.questionNo],timer:counter,"mode":"quizEditMode"});
                      _this.io.in('quizReadMode').emit('timer', {"question":_this.questionList[_this.questionNo],timer:counter,"mode":"quizReadMode"});
                  }
              }
          }
    }
}
socketComponent.firstQuizPass = function(){
    insertInReadMode = true;
    insertInRoomquiz = false;
}
socketComponent.quizStart = function(isSingle){
    this.quizStarted = true;
    if(!isSingle){
        socketComponent.questionDetails();
    }
}
socketComponent.disconnect = function(){
		quizModel.deleteSocketSession(this.socket.id,(err,res)=>{

		})
		activeUser.splice(activeUser.indexOf(this.socket.userFBId), 1);
    clients.splice(clients.indexOf(this.socket), 1);
}
socketComponent.quizResult =function() {
		clients = [];
		_this = this;
		console.log(activeUser,"active");
    console.log(inActiveUser,"InActive");
		quizModel.getWinerList(activeUser,(err,res)=>{
				if(!err){
					activeUser = [];
					inActiveUser = []
					_this.io.in('quizEditMode').emit('winnerList',{"mode":"quizEditMode",winners:res,"winnerAmount":200});
					_this.io.in('quizReadMode').emit('winnerList',{"mode":"quizReadMode",winners:res,"winnerAmount":200});
				}
		})
}
module.exports = socketComponent;
