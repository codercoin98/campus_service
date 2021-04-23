const chatService = require('../service/chat.service')
const { changeUTC } = require('../utils/time.handle')
class ChatController {
    //根据用户id获取聊天记录
    async getRecord (ctx, next) {
        const uid = ctx.request.query.uid
        console.log(uid)
        const result = await chatService.getRecord(uid)

        if (result) {
            result.forEach(item => {
                item.send_at = changeUTC(item.send_at)
            })
        }
        ctx.body = result
    }
}
module.exports = new ChatController()