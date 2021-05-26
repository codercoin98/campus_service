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
    //获取会话的最新的消息
    async getLastMessage (uid, session_user) {
        const statement = 'SELECT * FROM `user_chat_message` WHERE (`from_id` = ? AND `to_id` = ?) OR (`from_id` = ? AND `to_id` = ?) ORDER BY `send_at` DESC LIMIT 1'

        const [result] = await connection.execute(statement, [uid, session_user, session_user, uid])
        //返回结果
        return result
    }
    //创建用户会话
    async createSession (from_id, to_id) {
        //先判断是否有已建立的相同的会话
        const statement1 = 'SELECT * FROM `user_session` WHERE (`from_user_id` = ? AND `to_user_id` = ?) OR (`from_user_id` = ? AND `to_user_id` = ?) LIMIT 1'

        const [result] = await connection.execute(statement1, [from_id, to_id, to_id, from_id])
        if (result.length === 0) {
            //没有记录，创建会话    
            const statement2 = 'INSERT INTO `user_session` (`from_user_id`,`to_user_id`) VALUES (?,?)'

            await connection.execute(statement2, [from_id, to_id])
        } else {
            return
        }

    }
    //获取用户的所有会话
    async getUserSesssion (uid) {
        const statement1 = 'SELECT * FROM `user_session` WHERE `from_user_id` = ? OR `to_user_id` = ?'
        const [result] = await connection.execute(statement1, [uid, uid])
        return result
    }
    //获取未读信息的条数
    async getUnreadMessageNum (to_id, from_id) {
        const statement = 'SELECT COUNT(*) AS num FROM `user_chat_message` WHERE `from_id` = ? AND `to_id` = ? AND `read` = 0'

        const [result] = await connection.execute(statement, [from_id, to_id])

        return result[0]
    }
}

module.exports = new chatService()