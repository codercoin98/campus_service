const Router = require('koa-router')
const { getRecord,readALLMessage,readMessage,getUnreadMessage } = require('../controller/chat.controller')
const chatRouter = new Router({ prefix: '/chat' })

chatRouter.get('/getRecord', getRecord)
//将所有的未读消息标记为已读
chatRouter.post('/readALLMessage',readALLMessage)
//将最新接受的消息标记为已读
chatRouter.post('/readMessage',readMessage)
//获取是否有未读消息
chatRouter.get('/getUnreadMessage',getUnreadMessage)
module.exports = chatRouter