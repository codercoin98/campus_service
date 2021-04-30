const chatRouter = require('../router/chat.router')
const chatService = require('../service/chat.service')
const { changeUTC } = require('../utils/time.handle')
class ChatController {
    //根据用户id获取聊天记录
    async getRecord (ctx, next) {
        const uid = parseInt(ctx.request.query.uid)
        const to_id = parseInt(ctx.request.query.to_id)
        console.log(uid, to_id)
        const result = await chatService.getRecord(uid, to_id)

        if (result) {
            result.forEach(item => {
                item.send_at = changeUTC(item.send_at)
            })
        }
        ctx.body = result
    }
    //将所有未读消息标记为已读
    async readALLMessage (ctx, next) {
        const { from_id, to_id } = ctx.request.body
        const res = await chatService.readALLMessage(from_id, to_id)
        ctx.body = res
    }
    //将最新消息标记为已读
    async readMessage (ctx, next) {
        const { message_id } = ctx.request.body
        console.log(message_id)
        const res = await chatService.readLastMessage(message_id)
        ctx.body = res
    }
    //获取是否有未读消息
    async getUnreadMessage (ctx, next) {
        const to_id = parseInt(ctx.request.query.to_id)
        const result = await chatService.getUnreadMessage(to_id)
        console.log(result)
        if (result.length !== 0) {
            const message = 'HAVE'
            ctx.body = { message }
        } else {
            const message = 'HAVE_NOT'
            ctx.body = { message }
        }
    }
}
module.exports = new ChatController()