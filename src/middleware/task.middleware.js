const { APP_HOST, APP_PORT } = require('../app/config')
const taskService = require('../service/task.service')
const balanceService = require('../service/balance.service');
const {FloatAdd} = require('../utils/balance.handle');
//生成任务编号
const createTaskNumber = (uid) => {
    let date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    m = m < 10 ? '0' + m : m
    let d = date.getDate()
    let h = date.getHours()
    h = h < 10 ? '0' + h : h
    let minute = date.getMinutes()
    let second = date.getSeconds()
    minute = minute < 10 ? '0' + minute : minute

    let deadtime = y + m + d + h + minute + second + uid

    return deadtime

}
//生成文件地址,json对象
const createFileUrl = (filenmaeList) => {
    const url = {}
    filenmaeList.forEach((item, index) => {
        url[index] = `${APP_HOST}:${APP_PORT}/task/getTaskFile/${item}`
    })
    const url_json = JSON.stringify(url)
    return url_json
}
//任务完成后，将任务金转至代跑用户账户
const transferAccounts = async (tid,releaser_id,receiver_id) => {
    //1.先获取任务的编号
    const {task_number} = await taskService.getTaskNumber(tid)
    //2.根据任务编号和用户id获取预付款
    const {advance} = await taskService.getAdvance(task_number,releaser_id)
    //更新代跑用户的余额
    //3.1先获取代跑用户余额
    const {balance} = await balanceService.getUserBalance(receiver_id)

    const new_balance = FloatAdd(parseFloat(advance),parseFloat(balance))
    //3.2更新余额
    await balanceService.updateUserBalance(new_balance,receiver_id)

    //更新代跑用户余额变更记录
    await balanceService.createBalanceRecord(4,parseFloat(advance),receiver_id)
}
module.exports = {
    createTaskNumber,
    createFileUrl,
    transferAccounts
}