const connection = require('../app/database')
class systemService {
    //获取所有闲置任务
    async getAllFreeTask () {
        const statement = 'SELECT * FROM `task` WHERE `status` = 1 '
        const [result] = await connection.execute(statement)
        return result
    }
    //任务过期，改变状态
    async updateFreeTaskStatus (tid) {
        const statement = 'UPDATE `task` SET `status` = 4 WHERE `tid` = ?'
        await connection.execute(statement, [tid])
    }
    //获取所有的进行中的任务
    async getALLReceiveTask () {
        const statement = 'SELECT * FROM `task` WHERE `status` = 2'
        const [result] = await connection.execute(statement)
        return result
    }
    //获取进行中任务的进程
    async getReceiverConfirmAt (tid) {
        const statement = 'SELECT `receiver_confirm_at` FROM `task_receive_process` WHERE `tid` = ?'
        const [result] = await connection.execute(statement, [tid])
        return result
    }
    //改变超时任务的状态为超时
    async updateReceiveTaskStatus (tid) {
        const statement = 'UPDATE `task` SET `status` = 5 WHERE `status` = 2 AND `tid` = ?'
        await connection.execute(statement, [tid])
    }
    //获取对应任务的接取用户的信誉分
    async getReceiverByTid (tid) {
        const statement = 'SELECT `receiver_id` FROM `user_receive_task` WHERE `tid` = ?'
        const [result] = await connection.execute(statement, [tid])
        return result
    }
}

module.exports = new systemService()