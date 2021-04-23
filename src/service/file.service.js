const connection = require('../app/database')
class FileService {
    //根据用户id更新用户上传头像图片的信息
    async updateAvatar (filename, mimetype, size, userId) {
        const statement = 'UPDATE `avatar` SET `filename` = ? ,`mimetype` = ? ,`size` = ?  WHERE `user_id` = ?'
        const result = await connection.execute(statement, [filename, mimetype, size, userId])
        console.log(result)
        return result[0]
    }
    //插入用户上传头像图片的信息
    async createAvatar (filename, mimetype, size, userId) {
        const statement = 'INSERT INTO `avatar` (`filename`,`mimetype`,`size`,`user_id`) VALUES(?,?,?,?)'
        const result = await connection.execute(statement, [filename, mimetype, size, userId])
        return result[0]
    }
    //根据用户id获取对应的头像
    async getAvatarByUserId (userId) {
        const statement = 'SELECT * FROM `avatar` WHERE `user_id` = ?'
        const result = await connection.execute(statement, [userId])

        return result[0]

    }
}
module.exports = new FileService()