const Router = require('koa-router')
const { getRecord } = require('../controller/chat.controller')
const chatRouter = new Router({ prefix: '/chat' })

chatRouter.get('/getRecord', getRecord)

module.exports = chatRouter