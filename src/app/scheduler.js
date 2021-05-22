/* 定时调度任务 */
const schedule = require('node-schedule')
const systemService = require('../service/system.service')
const taskService = require('../service/task.service')
const balanceService = require('../service/balance.service')
const rule = new schedule.RecurrenceRule()
const { checkExpirationTime } = require('../middleware/system.middleware')
const { changeUTC } = require('../utils/time.handle')
const { FloatAdd } = require('../utils/balance.handle')
const moment = require('moment')
const userService = require('../service/user.service')
rule.second = [0, 9, 19, 29, 39, 49, 59]
//定时检测任务是否过期和超时
schedule.scheduleJob(rule, async () => {
    //检测闲置任务是否过期，过期则改变状态,返还预付金
    checkExpirationTime()
    //检测已被接取的任务是否超时，超时则改变状态
    //1.获取所有已被接取的任务
    const result = await systemService.getALLReceiveTask()
    if (result.length !== 0) {
        //2.获取所有的已接取任务的进程
        for (item of result) {
            const { receiver_confirm_at } = await systemService.getReceiverConfirmAt(item.tid)
            if ((!receiver_confirm_at && changeUTC(item.expiration_time) < moment().format('YYYY-MM-DD HH:mm:ss'))
                || (receiver_confirm_at && changeUTC(item.expiration_time) < moment().format('YYYY-MM-DD HH:mm:ss'))) {
                //代跑用户未在有效时间内确认送达，任务超时,改变任务状态
                await systemService.updateReceiveTaskStatus(item.tid)
                //返还发布用户预付金
                //1.获取预付金记录，2.获取发布用户余额，3.更新用户余额
                const { advance } = await taskService.getAdvance(item.task_number, item.owner_id)
                const { balance } = await balanceService.getUserBalance(item.owner_id)
                const new_balance = FloatAdd(parseFloat(balance), parseFloat(advance))
                await balanceService.updateUserBalance(parseFloat(new_balance), item.owner_id)
                //4.生成余额记录
                await balanceService.createBalanceRecord(5, parseFloat(advance), item.owner_id)
                //5.获取代跑用户的信誉分，6.更改代跑用户信誉分
                const { receiver_id } = await systemService.getReceiverByTid(item.tid)
                const { credit_points } = await userService.getCreditPoints(receiver_id)
                //超时或未完成扣10分
                const new_credit_points = credit_points - 10
                await userService.updateCreditPoints(receiver_id, new_credit_points)
            }
        }
    }
})