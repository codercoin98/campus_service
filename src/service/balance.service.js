const connection = require('../app/database')

class BalanceClass {
    //插入用户支付密码
    async InsertPayPassword (confirmPassword, user_id) {
        const statement = 'UPDATE `user` SET `pay_password` = ? WHERE `uid` = ? '
        const result = await connection.execute(statement, [confirmPassword, user_id])
        return result[0]
    }
    //获取用户支付密码
    async getUserPayPassword (user_id) {
        const statement = 'SELECT `pay_password` FROM `user` WHERE `uid` = ?'
        const [result] = await connection.execute(statement, [user_id])
        return result[0]
    }
    //更新用户密码
    async updatePayPassword (oldPassword, newPassword, uid) {
        //判断旧密码是否正确
        const statement = 'SELECT `pay_password` FROM `user` WHERE `uid` = ?'
        const [selectResult] = await connection.execute(statement, [uid])
        if (selectResult[0].pay_password === oldPassword) {
            //旧密码匹配，更新密码
            const result = this.InsertPayPassword(newPassword, uid)
            return result
        } else {
            const errorMessage = 'WRONG_OLDPASSWORD'
            return errorMessage
        }
    }
    //获取账户余额
    async getUserBalance (uid) {
        const statement = 'SELECT `balance` FROM `user` WHERE `uid` = ?'
        const [result] = await connection.execute(statement, [uid])

        return result[0]
    }
    //获取用户余额记录总数
    async getUserRecordTotal (uid) {
        const statement = 'SELECT COUNT(*) AS num FROM `balance_record` WHERE `user_id` = ?'
        const [result] = await connection.execute(statement, [uid])
        return result[0]
    }
    //获取用户余额记录
    async getUserRecord (uid, pageNo, pageSize) {
        const offset = (pageNo - 1) * pageSize
        const statement = 'SELECT * FROM `balance_record`  WHERE `user_id` = ? ORDER BY `createAt` DESC LIMIT ?,?'
        const [result] = await connection.execute(statement, [uid, offset, pageSize])
        return result
    }
    //更新用户余额
    async updateUserBalance (new_balance, uid) {
        const statement = 'UPDATE `user` SET `balance` = ? WHERE `uid` = ? '
        const [updateResult] = await connection.execute(statement, [new_balance, uid])
        return updateResult
    }
    //插入用户充值记录
    async recharge (type, money, pay_methods, user_id) {
        const statement = 'INSERT INTO `balance_record` (`type`,`recharge_type`,`money`,`user_id`) VALUES (?,?,?,?)'
        await connection.execute(statement, [type, pay_methods, money, user_id])
    }
    //生成用户提现记录
    async withdraw (type, new_withdraw_value, user_id) {
        const statement = 'INSERT INTO `balance_record` (`type`,`money`,`user_id`) VALUES (?,?,?)'
        await connection.execute(statement, [type, new_withdraw_value, user_id])
    }
    //生成用户任务支出和任务收入记录
    async createBalanceRecord (type, advance, uid) {
        const statement = 'INSERT INTO `balance_record` (`type`,`money`,`user_id`) VALUES (?,?,?)'
        await connection.execute(statement, [type, advance, uid])
    }
    //生成预付款记录
    async createAdvance (uid, task_number, advance) {
        const statement3 = 'INSERT INTO `user_advance` (`advance`,`task_number`,`user_id`) VALUES (?,?,?)'
        await connection.execute(statement3, [advance, task_number, uid])
    }
}
module.exports = new BalanceClass()