var user = require("./controller/user.js");
var quiz = require("./controller/quiz.js");
const Joi = require('joi');

var route = [		
	{
		method: 'get',
		path:'/Test',
		config: {		
			handler:function(){
				console.log(process.env.socketConfig)
			},
			description: 'get Image',
			notes: 'images',
			tags: ['api']
		}
	},
	{
		method: 'get',
		path:'/user/{userId}',
		config: {		
			handler:user.userDetails,
			description: 'get user details',
			notes: 'get user details',
			tags: ['api'],
			validate: {
				params:{
					userId: Joi.number().required(),
				}
			}
		}
	},
	{
		method: 'POST',
		path:'/user-check',
		config: {		
			handler:user.checkUser,
			description: 'Checking user in db or not',
			notes: 'Checking user in db or not',
			tags: ['api'],
			validate: {
				payload: {
					name: Joi.string().required(),
					userId: Joi.number().required(),
					email: Joi.string().required(),
					thumbnail: Joi.string().optional().allow('')
				}
			}
		}
	},
	{
		method: 'get',
		path:'/next-quiz',
		config: {		
			handler:quiz.nextQuiz,
			description: 'get next 3 quiz',
			notes: 'get next 3 quiz',
			tags: ['api']
		}
	},
];

module.exports = route;