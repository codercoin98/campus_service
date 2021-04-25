const connection = require('../app/database')

class adminService {
    //获取管理员账号和密码
    async getAdmin (id) {
        const statement = 'SELECT * FROM `admin` WHERE `admin_id` = ?'
        const [result] = await connection.execute(statement, [id])
        return result[0]
    }
    //更新管理员密码
    async updateAdminPassword (username, password) {
        const statement = 'UPDATE `admin` SET `admin_password` = ? WHERE `admin_account` = ?'
        const [result] = await connection.execute(statement, [password, username])
        return result[0]
    }
    //获取所有用户信息，分页查询
    async getAllUser (pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `user` LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //按用户名查询用户
    async getUserByUsername (username) {
        const statement = 'SELECT * FROM `user` WHERE `username` = ?'
        const [result] = await connection.execute(statement, [username])
        return result[0]
    }
    //禁用用户
    async forbiddenUser(uid,username, reason, type){
        const statement1 = 'UPDATE `user` SET `is_forbidden` = 1  WHERE `uid` = ?'
        await connection.execute(statement1, [uid])
        const statement2 = 'INSERT INTO `user_forbidden` (`user_id`,`username`,`reason`,`type`) VALUES (?,?,?,?)'
        const [result] = await connection.execute(statement2, [uid,username,reason,type])
        return result
    }
    //获取禁用用户
    async getForbiddenUser (pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT `user`.username,`user_forbidden`.type,`user_forbidden`.reason,`user_forbidden`.createAt FROM `user`,`user_forbidden` WHERE `user`.uid = `user_forbidden`.user_id AND `user`.is_forbidden = 1 AND `user_forbidden`.is_release = 0 LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //解除用户禁用状态
    async releaseUser(username) {
        const statement = 'UPDATE `user` SET `is_forbidden` = 0 WHERE `username` = ?'
        const [result] = await connection.execute(statement, [username])
        return result
    }
    //改变禁用记录为已解除
    async changeForbiddenStatus(username) {
        const statement = 'UPDATE `user_forbidden` SET `is_release` = 1 WHERE `username` = ?'
        const [result] = await connection.execute(statement, [username])
        return result
    }
    //获取用户投诉
    async getComplainInfo(pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `user_complain` LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //获取代跑任务
    async getTaskInfo(pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `task` LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //获取学生认证信息
    async getStudentInfo(pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `user_student_info` LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
}

module.exports = new adminService()