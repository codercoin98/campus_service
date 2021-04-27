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
    async forbiddenUser (uid, username, reason, type) {
        const statement1 = 'UPDATE `user` SET `is_forbidden` = 1  WHERE `uid` = ?'
        await connection.execute(statement1, [uid])
        const statement2 = 'INSERT INTO `user_forbidden` (`user_id`,`username`,`reason`,`type`) VALUES (?,?,?,?)'
        const [result] = await connection.execute(statement2, [uid, username, reason, type])
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
    async releaseUser (username) {
        const statement = 'UPDATE `user` SET `is_forbidden` = 0 WHERE `username` = ?'
        const [result] = await connection.execute(statement, [username])
        return result
    }
    //改变禁用记录为已解除
    async changeForbiddenStatus (username) {
        const statement = 'UPDATE `user_forbidden` SET `is_release` = 1 WHERE `username` = ?'
        const [result] = await connection.execute(statement, [username])
        return result
    }
    //获取用户投诉
    async getComplainInfo (pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `user_complain` LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //获取代跑任务
    async getTaskInfo (pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `task` LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //获取已处理的学生认证信息
    async getStudentInfo (pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `user_student_info`WHERE `audit_status` = 1 OR `audit_status` = 2 LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //获取待审核的学生认证信息
    async getNewStudentInfo (pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `user_student_info`WHERE `audit_status` = 0 LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //审核学生信息
    async handlePassAndReject (uid, status) {
        const statement = 'UPDATE `user_student_info`SET `audit_status` = ? WHERE `user_id` = ?'
        const [result] = await connection.execute(statement, [status, uid])
        return result
    }
    //获取用户账户流水
    async getBalanceInfo (pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `balance_record` LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //按类型获取账户流水
    async searchBalance (type, pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `balance_record` WHERE `type` = ? LIMIT ?,?'
        const [result] = await connection.execute(statement, [type, offset, pageSize])
        return result
    }
    //获取全部学生认证信息
    async getAllStudentInfo () {
        const statement = 'SELECT * FROM `user_student_info`'
        const [result] = await connection.execute(statement)
        return result
    }
    //获取全部的学生信息
    async getAllUserInfo () {
        const statement = 'SELECT * FROM `user`'
        const [result] = await connection.execute(statement)
        return result
    }
    //获取全部任务信息
    async getAllTaskInfo () {
        const statement = 'SELECT * FROM `task`'
        const [result] = await connection.execute(statement)
        return result
    }
    //获取全部账户流水信息
    async getAllBalanceInfo () {
        const statement = 'SELECT * FROM `balance_record`'
        const [result] = await connection.execute(statement)
        return result
    }

    //获取total
    //获取全部待审核学生条数
    async getNewStudentTotal () {
        const statement = 'SELECT COUNT(*) AS num FROM `user_student_info` WHERE `audit_status` = 0'
        const [result] = await connection.execute(statement)
        return result[0]
    }
    //获取全部学生条数
    async getStudentTotal () {
        const statement = 'SELECT COUNT(*) AS num FROM `user_student_info`'
        const [result] = await connection.execute(statement)
        return result[0]
    }
    //获取全部的用户条数
    async getUserTotal () {
        const statement = 'SELECT COUNT(*) AS num FROM `user`'
        const [result] = await connection.execute(statement)
        return result[0]
    }
    //获取全部的任务条数
    async getTaskTotal () {
        const statement = 'SELECT COUNT(*) AS num FROM `task`'
        const [result] = await connection.execute(statement)
        return result[0]
    }
    //获取全部的账户流水条数
    async getBalanceTotal () {
        const statement = 'SELECT COUNT(*) AS num FROM `balance_record`'
        const [result] = await connection.execute(statement)
        return result[0]
    }
    //查找学生信息
    async searchStudent (university, status) {

        if (status === 3 && university) {
            const statement = "SELECT * FROM `user_student_info` WHERE `university_name` LIKE CONCAT('%',?,'%')"
            const [result] = await connection.execute(statement, [university])
            console.log(result)
            return result
        } else if (university) {
            const statement = "SELECT * FROM `user_student_info` WHERE `university_name` LIKE CONCAT('%',?,'%') AND `audit_status` = ?"
            const [result] = await connection.execute(statement, [university, status])
            return result
        } else if (!university) {
            const statement = "SELECT * FROM `user_student_info` WHERE `audit_status` = ?"
            const [result] = await connection.execute(statement, [status])
            return result
        }

    }
    //查找任务信息
    async searchTask (type, status, pageNo, pageSize) {
        if (!type && status) {
            const statement = "SELECT * FROM `task` WHERE `status` = ? LIMIT ?,?"
            const [result] = await connection.execute(statement, [status, pageNo, pageSize])
            return result
        } else if (type && !status) {
            const statement = "SELECT * FROM `task` WHERE `type` = ? LIMIT ?,?"
            const [result] = await connection.execute(statement, [type, pageNo, pageSize])
            return result
        } else {
            const statement = "SELECT * FROM `task` WHERE `type` = ? AND `status` = ? LIMIT ?,?"
            const [result] = await connection.execute(statement, [type, status, pageNo, pageSize])
            return result
        }
    }
}

module.exports = new adminService()