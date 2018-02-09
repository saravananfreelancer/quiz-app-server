process.env.ROLE = "dev";
var router = require('./component/route');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const Joi = require('joi');
const moment = require('moment');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');
const server = new Hapi.Server();
var socketComponent = require("./component/socket/index.js");
var config = require("./config/config.js")[process.env.ROLE];
var db = require("./db/db.js");
process.env["questionTime"] = 10;
process.env["answerTime"] = 5;
process.env["breakTime"] = 10;
process.env["startBefore"] = 300; // this will updated when Server Respond
db.query("SELECT * FROM config",function(err,res){
	if(!err){
		if(res.length > 0){
			res.map(function(records){
				process.env[records.configKey] = Number(records.configValue);
			});
			console.log("DB CONFIG UPDATED",process.env.questionTime);
			var quizScheduleTime = [moment().add(20,"seconds").format("YYYY-MM-DD HH:mm:ss"),"2018-02-02 13:45:00","2018-02-01 13:45:00"];

			socketComponent.scheduleJobEvents(quizScheduleTime);
		} else {
			console.log("****CONGIF NO DATA*****")
		}
	} else {
		console.log("****CONGIF ERROR*****");
	}
});
server.connection({
	//host: "localhost",
	port: process.env.PORT || config.server.port,
	routes: { cors: true }
});
var io = require('socket.io')(server.listener, { pingTimeout: 30000 });
io.on('connection', function(socket){
    socketComponent.onLoad(socket,io);
});

//socketComponent.quizGoingStart();

const options = {
	info: {
		'title': 'Quiz APP',
		'version': Pack.version,
	}
};

server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': options
    }], (err) => {
        server.start( (err) => {
           if (err) {
                console.log(err);
            } else {
                console.log('Server running at:', server.info.uri);
            }
        });
    });


router.map(function(routerData) {
	server.route(routerData);
})
