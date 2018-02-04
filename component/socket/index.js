var moment = require("moment");
var schedule = require('node-schedule');
var clients = [];
var insertInRoomquiz,insertInReadMode;
var socketComponent = {};

socketComponent.scheduleJobEvents = function(quizScheduleTime,configDetails) {
	var configDetails = process.env;
	configDetails.questionTime = Number(configDetails.questionTime);
	configDetails.answerTime = Number(configDetails.answerTime);
	configDetails.breakTime = Number(configDetails.breakTime);
	configDetails.startBefore = Number(configDetails.startBefore);
    quizScheduleTime.map(function(scheduleTime){
        /*scheduleTime = scheduleTime.split(":");
        var scheduleTimeHours = scheduleTime[0],
            scheduleTimeMinutes = scheduleTime[1];
        var cronTimeHours,cronTimeMinutes;
        if(scheduleTimeMinutes == "00") {
            cronTime = Number(scheduleTimeHours) - 1;
            cronTimeMinutes = "55";
        } else {
            cronTime = Number(scheduleTimeHours);
            cronTimeMinutes = Number(scheduleTimeMinutes) - 5;
        }*/
        var cronTime = new Date(moment(scheduleTime,"YYYY-MM-DD HH:mm:ss").format()),
            cronTimeBefore = new Date(moment(scheduleTime,"YYYY-MM-DD HH:mm:ss").subtract(1, 'minutes').format());
            //cronTimeBefore = new Date(moment(scheduleTime,"YYYY-MM-DD HH:mm:ss").subtract(configDetails.startBefore, 'minutes').format());
            cronTimefirstQuestionPass= new Date(moment(scheduleTime,"YYYY-MM-DD HH:mm:ss").add(configDetails.questionTime, 'seconds').format());
        schedule.scheduleJob(cronTimeBefore, function(){
            console.log("going to start")
              socketComponent.quizGoingStart();
        });
        schedule.scheduleJob(cronTime, function(){
            console.log("start")
              socketComponent.quizStart();
        });
        schedule.scheduleJob(cronTimefirstQuestionPass, function(){
            console.log("first Question pass")
              socketComponent.firstQuizPass();
        });
    });
}
 
 
 
socketComponent.onLoad = function(socket,io,Config) {
	var Config = process.env;
	Config.questionTime = Number(Config.questionTime);
	Config.answerTime = Number(Config.answerTime);
	Config.breakTime = Number(Config.breakTime);
	Config.startBefore = Number(Config.startBefore);
    this.socket = socket;
    this.io = io;
    this.gapBetweenQuiz = Number(Config.questionTime) + Number(Config.answerTime) + Number(Config.breakTime);
    this.config = Config
    clients.push(socket); 
    //console.log(clients);    
    socket.on("userDetails",function(userData){
        socketComponent.userDetails(userData)
    });
    socket.on("quizResponse",function(data){
        socketComponent.quizResponse(data)
    });
    socket.on('disconnect', function() {
        socketComponent.disconnect()
    });
    //console.log(insertInReadMode)
    if(insertInRoomquiz) {
        this.socket.join("quizEditMode");
    } else if(insertInReadMode){
        this.socket.join("quizReadMode");
    }
    if(this.quizStarted) {
        socketComponent.quizStart(true);
    }
    //if(clients.length  == 2){
    //    console.log("adasasdasdas")
    //    socketComponent.quizGoingStart();
   // }
}
socketComponent.userDetails = function(data){
    var examTime = moment().add(3,"minutes").format();
    this.socket.emit("quizTiming",{"quizTime":examTime,"currentTime":moment().format()});
}
socketComponent.quizGoingStart = function(){
    insertInRoomquiz = true;
    if(clients.length > 0){
        clients.map(function(clientDetails){
            clientDetails.join("quizEditMode");
        });
        if(this.io){
            this.io.in('quizEditMode').emit('quizGoingToStart', {"date":moment().format()});
        }        
    }
    
    //this.insertInReadMode = true;
    //this.quizStart();
}
socketComponent.questionDetails = function(){
    this.questionList = [{"question":"1","option":["sdsadsa","asdasdasds","asdssds"],"answer":1},
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
    ];
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
        this.socket.leave('quizEditMode');
        this.socket.leave('quizReadMode');
    }
}
socketComponent.sendQuestion = function(){
    this.questionNo += 1;
    if(this.io) {
        this.io.in('quizEditMode').emit('quizEditMode', this.questionList[this.questionNo]);
        this.io.in('quizReadMode').emit('quizReadMode', this.questionList[this.questionNo]);
    }
    //console.log(this.questionNo < (this.questionList.length - 1),this.questionNo,this.questionList.length)
    if(this.questionNo < (this.questionList.length - 1)){
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
                  if(counter > Number(_this.config.questionTime) && counter <= (Number(_this.config.questionTime) + Number(_this.config.answerTime))){
                      _this.io.in('quizEditMode').emit('showAnwserTimer', {"mode":"quizEditMode",timer:Number(_this.config.answerTime)});
                      _this.io.in('quizReadMode').emit('showAnwserTimer', {"mode":"quizReadMode",timer:Number(_this.config.answerTime)});                      
                  } else if(counter > (Number(_this.config.questionTime) + Number(_this.config.answerTime))){
                      _this.io.in('quizEditMode').emit('showTimerBreak', {"mode":"quizEditMode",timer:Number(_this.config.breakTime)});
                      _this.io.in('quizReadMode').emit('showTimerBreak', {"mode":"quizReadMode",timer:Number(_this.config.breakTime)});       
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
socketComponent.disconnect =function(){
    clients.splice(clients.indexOf(this.socket), 1);
}
socketComponent.quizResult =function(){
    console.log(this.io.in('quizEditMode').clients());
}
module.exports = socketComponent; 