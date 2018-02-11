var user = require("./controller/user.js");
var quiz = require("./controller/quiz.js");
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);

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
		path:'/quiz-question/{questionId}',

		config: {
			auth: 'Bearer',
			handler:quiz.getQuestion,
			description: 'Get quiz question',
			notes: 'Get quiz question',
			tags: ['api'],
			validate: {
				params:{
					questionId: Joi.string().optional(),
				},
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			}
		}
	},
	{
		method: 'POST',
		path:'/quiz/create',
		config: {
			handler:quiz.createQuestion,
			description: 'Create quiz question',
			notes: 'Create quiz question',
			tags: ['api'],
			auth: 'Bearer',
			validate: {
				payload:{
					quiz:{
						"title":Joi.string().required(),
						"quizOn":Joi.string().required(),
						"price":Joi.number().required(),
						"createdBy":Joi.string().required(),
						"question":Joi.array().items({
							"description":Joi.string().required(),
							"value":Joi.number().required(),
							"option":Joi.array().required()
						})
					},
				},
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			}
		}
	},
	{
		method: 'POST',
		path:'/quiz/update',
		config: {
			handler:quiz.updateQuestion,
			description: 'update quiz question',
			notes: 'update quiz question',
			tags: ['api'],
			auth: 'Bearer',
			validate: {
				payload:{
					quiz:{
						"quizId":Joi.string().required(),
						"title":Joi.string().required(),
						"quizOn":Joi.string().required(),
						"price":Joi.number().required(),
						"createdBy":Joi.string().required(),
						"question":Joi.array().items({
							"description":Joi.string().required(),
							"value":Joi.number().required(),
							"option":Joi.array().required()
						})
					},
				},
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			}
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
				},
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			},
			auth: 'Bearer',
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
			tags: ['api'],
			validate:{
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			},
			auth: 'Bearer',
		}
	},
	{
		method: 'get',
		path:'/user-list',
		config: {
			handler:user.listOfUser,
			description: 'get userList',
			notes: 'get userList',
			tags: ['api'],
			validate:{
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			},
			auth: 'Bearer',
		}
	},
	{
		method: 'POST',
		path:'/user/block',
		config: {
			handler:user.blockUser,
			description: 'get userList',
			notes: 'get userList',
			tags: ['api'],
			validate: {
				payload:{
					userId: Joi.string().required(),
					isBlock:Joi.boolean().required()
				},
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			},
			auth: 'Bearer',
		}
	},
	{
		method: 'POST',
		path:'/payment/request',
		config: {
			handler:quiz.request,
			description: 'get userList',
			notes: 'get userList',
			tags: ['api'],
			validate: {
				payload:{
					userId: Joi.string().required(),
					amount:Joi.string().required(),
					email:Joi.string().optional(),
					phone:Joi.string().optional(),
					withDrawType:Joi.string().allow("payTM","paypal").required(),
				},
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			},
			auth: 'Bearer',
		}
	},
	{
		method: 'POST',
		path:'/admin/login',
		config: {
			handler:user.login,
			description: 'user Login',
			notes: 'user Login',
			tags: ['api'],
			validate: {
				payload:{
					userName: Joi.string().required(),
					password:Joi.string().required()
				},
			}
		}
	},
	{
		method: 'POST',
		path:'/admin/create',
		config: {
			handler:user.createAdmin,
			description: 'user Login',
			notes: 'user Login',
			tags: ['api'],
			validate: {
				payload:{
					userName: Joi.string().required(),
					password:Joi.string().required(),
				},
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			},
			auth: 'Bearer',
		}
	},
	{
		method: 'POST',
		path:'/admin/password-change',
		config: {
			handler:user.changePassword,
			description: 'password Change',
			notes: 'password Change',
			tags: ['api'],
			validate: {
				payload:{
					userName:Joi.string().required(),
					oldPassword: Joi.string().required(),
					password:Joi.string().required(),
				},
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			},
			auth: 'Bearer',
		}
	},
	{
		method: 'GET',
		path:'/payment/list',
		config: {
			handler:quiz.paymentList,
			description: 'get paymentList',
			notes: 'get paymentList',
			tags: ['api'],
			validate:{
				headers: Joi.object({
            'authorization': Joi.string().required()
        }).options({ allowUnknown: true })
			},
			auth: 'Bearer',
		}
	},
];

module.exports = route;
