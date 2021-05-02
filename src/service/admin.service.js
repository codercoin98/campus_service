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
        return result
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
    //回复用户受理
    async replyComplaint(complaint_id,reply,reply_at) {
        const statement = 'UPDATE `user_complaint` SET `have_deal` = 1, `reply` = ? , `reply_at` = ? WHERE `id` = ?'
        const [result] = await connection.execute(statement, [reply,reply_at,complaint_id])
        return result
    }
    //获取已受理的用户投诉
    async getComplaintInfo (pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `user_complaint` WHERE `have_deal` = 1 LIMIT ?,?'
        const [result] = await connection.execute(statement, [offset, pageSize])
        return result
    }
    //获取待处理的用户投诉
    async getNewComplaintInfo(pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `user_complaint` WHERE `have_deal` = 0 LIMIT ?,?'
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
    //改变用户的权限
    async updateUserRight (uid) {
        const statement = 'UPDATE `user`SET `right` = ? WHERE `uid` = ?'
        await connection.execute(statement, [2, uid])
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
    //获取所有已受理投诉记录
    async getComplaintTotal () {
        const statement = 'SELECT COUNT(*) AS num FROM `user_complaint` WHERE `have_deal` = 1'
        const [result] = await connection.execute(statement)
        return result[0]
    }
    //获取待处理的投诉
    async getNewComplaintTotal() {
        const statement = 'SELECT COUNT(*) AS num FROM `user_complaint` WHERE `have_deal` = 0'
        const [result] = await connection.execute(statement)
        return result[0]
    }
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
    //查找用户信息
    async searchUser (keyword, region, pageNo, pageSize) {
        if (region === 'username') {
            const offset = (pageNo - 1) * pageSize
            const statement = "SELECT * FROM `user` WHERE `username` LIKE CONCAT(' % ',?,' % ') LIMIT ?,?"
            const [result] = await connection.execute(statement, [keyword, offset, pageSize])
            return result
        } else if (region === 'nickname') {
            const offset = (pageNo - 1) * pageSize
            const statement = "SELECT * FROM `user` WHERE `nickname` LIKE CONCAT(' % ',?,' % ') LIMIT ?,?"
            const [result] = await connection.execute(statement, [keyword, offset, pageSize])
            return result
        }

    }
    //查找学生信息
    async searchStudent (university, status, pageNo, pageSize) {

        if (status === 3 && university) {
            //有学校关键字，没有状态
            const offset = (pageNo - 1) * pageSize
            const statement = "SELECT * FROM `user_student_info` WHERE `university_name` LIKE CONCAT('%',?,'%') LIMIT ?,?"
            const [result] = await connection.execute(statement, [university, offset, pageSize])
            return result
        } else if (university && status) {
            //有学校关键字，有状态
            const offset = (pageNo - 1) * pageSize
            const statement = "SELECT * FROM `user_student_info` WHERE `university_name` LIKE CONCAT('%',?,'%') AND `audit_status` = ? LIMIT ?,?"
            const [result] = await connection.execute(statement, [university, status, offset, pageSize])
            return result
        } else if (!university && status) {
            //没有学校关键字，有状态
            const offset = (pageNo - 1) * pageSize
            const statement = "SELECT * FROM `user_student_info` WHERE `audit_status` = ? LIMIT ?,?"
            const [result] = await connection.execute(statement, [status, offset, pageSize])
            return result
        }

    }
    //查找任务信息
    async searchTask (type, status, pageNo, pageSize) {
        if (!type && status) {
            const offset = (pageNo - 1) * pageSize
            const statement = "SELECT * FROM `task` WHERE `status` = ? LIMIT ?,?"
            const [result] = await connection.execute(statement, [status, offset, pageSize])
            return result
        } else if (type && !status) {
            const offset = (pageNo - 1) * pageSize
            const statement = "SELECT * FROM `task` WHERE `type` = ? LIMIT ?,?"
            const [result] = await connection.execute(statement, [type, offset, pageSize])
            return result
        } else {
            const offset = (pageNo - 1) * pageSize
            const statement = "SELECT * FROM `task` WHERE `type` = ? AND `status` = ? LIMIT ?,?"
            const [result] = await connection.execute(statement, [type, status, offset, pageSize])
            return result
        }
    }
}

module.exports = new adminService()