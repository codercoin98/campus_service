const connection = require('../app/database')
class chatService {
    //保存用户发送的信息
    async saveSenderMessage (data) {
        const statement = 'INSERT INTO `user_chat_message` (`from_id`,`to_id`,`message_body`) VALUES (?,?,?)'

        const [result] = await connection.execute(statement, [data.from_id, data.to_id, data.message_body])

        //返回结果
        return result
    }
    //获取用户的聊天记录
    async getRecord (uid) {
        const statement = 'SELECT * FROM `user_chat_message` WHERE `from_id` = ? OR `to_id` = ? ORDER BY `send_at`'

        const [result] = await connection.execute(statement, [uid, uid])

        //返回结果
        return result
    }
}

module.exports = new chatService()