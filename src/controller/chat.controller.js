const chatService = require('../service/chat.service')
const userService = require('../service/user.service')
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
        console.log(ctx.request.body)
        const res = await chatService.readLastMessage(message_id)
        ctx.body = res
    }
    //获取是否有未读消息
    async getUnreadMessage (ctx, next) {
        const to_id = parseInt(ctx.request.query.to_id)
        const result = await chatService.getUnreadMessage(to_id)
        if (result.length !== 0) {
            const message = 'HAVE'
            ctx.body = { message }
        } else {
            const message = 'HAVE_NOT'
            ctx.body = { message }
        }
    }
    //创建用户会话
    async createSession (ctx, next) {
        const { from_id, to_id } = ctx.request.body
        const res = await chatService.createSession(from_id, to_id)
        ctx.body = res
    }
    //获取用户所有的会话
    async getUserSesssion (ctx, next) {
        const uid = parseInt(ctx.request.query.uid)
        //获取所有的会话
        const result = await chatService.getUserSesssion(uid)
        const session = []
        const session_item = {}
        if (result.length === 0) {
            ctx.body = session
            return
        }
        //根据会话获取对应会话用户的信息
        for (const item of result) {
            if (item.to_user_id === uid) {
                //获取的是对方创建的会话
                const to_user = await userService.getUserByUid(item.from_user_id)
                session_item.user = to_user
                session_item.id = item.id
                //获取未读消息条数
                const { num } = await chatService.getUnreadMessageNum(uid, item.from_user_id)
                session_item.un_read_num = num
            } else if (item.from_user_id === uid) {
                //获取的是自己创建的会话
                const to_user = await userService.getUserByUid(item.to_user_id)
                session_item.user = to_user
                session_item.id = item.id
                //获取未读消息条数
                const { num } = await chatService.getUnreadMessageNum(uid, item.to_user_id)
                session_item.un_read_num = num
            }
            //获取最新的聊天信息
            const last_message = await chatService.getLastMessage(item.from_user_id, item.to_user_id)
            console.log(last_message)
            if (last_message.length !== 0) {
                last_message[0].send_at = changeUTC(last_message[0].send_at)
                session_item.last_message = last_message[0]
            } else {
                ctx.body = []
                return
            }
            session.push(session_item)

        }
        console.log(session)
        ctx.body = session
    }
}
module.exports = new ChatController()