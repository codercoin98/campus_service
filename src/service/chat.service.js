const connection = require('../app/database')
class chatService {
    //保存用户发送的信息,
    async saveSenderMessage (data) {
        const statement = 'INSERT INTO `user_chat_message` (`from_id`,`to_id`,`message_body`) VALUES (?,?,?)'

        const [result] = await connection.execute(statement, [data.from_id, data.to_id, data.message_body])

        //返回结果
        return result
    }
    //获取最新插入消息的id
    async getLastMessageId (data) {
        const statement = 'select id FROM `user_chat_message` WHERE `from_id`=? AND `to_id` = ? ORDER BY `send_at` DESC LIMIT 1'
        const [result] = await connection.execute(statement, [data.from_id, data.to_id])
        return result[0]
    }
    //将最新消息置为已读
    async readLastMessage (message_id) {
        const statement = 'UPDATE `user_chat_message` SET `read` = 1 WHERE `id` = ?'
        const [res] = await connection.execute(statement, [message_id])
        return res
    }
    //将所有未读消息标记为已读
    async readALLMessage (from_id, to_id) {
        const statement = 'UPDATE `user_chat_message` SET `read` = 1 WHERE `from_id` = ? AND `to_id` = ? AND `read` = 0'
        const [res] = await connection.execute(statement, [from_id, to_id])
        return res

    }
    //获取用户的聊天记录
    async getRecord (uid, to_id) {
        const statement = 'SELECT * FROM `user_chat_message` WHERE (`from_id` = ? AND `to_id` = ?) OR (`from_id` = ? AND `to_id` = ?) ORDER BY `send_at`'

        const [result] = await connection.execute(statement, [uid, to_id, to_id, uid])

        //返回结果
        return result
    }
    //获取是否有新消息
    async getUnreadMessage (to_id) {
        const statement = 'SELECT * FROM `user_chat_message` WHERE `to_id` = ? AND `read` = 0'

        const [result] = await connection.execute(statement, [to_id])

        //返回结果
        return result
    }
}

module.exports = new chatService()