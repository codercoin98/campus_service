const connection = require('../app/database')

class adminService {
    //获取管理员账号和密码
    async getAdmin(id) {
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
}

module.exports = new adminService()