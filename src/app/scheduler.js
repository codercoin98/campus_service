/* 定时调度任务 */
const schedule = require('node-schedule')
const systemService = require('../service/system.service')
const rule = new schedule.RecurrenceRule()
const { changeUTC } = require('../utils/time.handle')
const moment = require('moment')
rule.second = [0, 29]
//定时检测任务是否过期和超时
schedule.scheduleJob(rule, async () => {
    //检测闲置任务是否过期，过期则改变状态
    await systemService.checkExpirationTime()
    //检测已被接取的任务是否超时，超时则改变状态
    //1.获取所有已被接取的任务
    const result = await systemService.getALLReceiveTask()
    if (result.length !== 0) {
        //2.获取所有的已接取任务的进程
        for (item of result) {
            const { receiver_confirm_at } = await systemService.getReceiverConfirmAt(item.tid)
            if (!receiver_confirm_at && changeUTC(item.expiration_time) < moment().format('YYYY-MM-DD HH:mm:ss')) {
                //代跑用户未在有效时间内确认送达，任务超时,改变任务状态
                await systemService.updateReceiveTaskStatus(item.tid)
            }else if(receiver_confirm_at && changeUTC(item.expiration_time) < moment().format('YYYY-MM-DD HH:mm:ss')){
                //代跑用户确认完成时间超过任务有效时间，任务超时，改变任务状态
                await systemService.updateReceiveTaskStatus(item.tid)
            }
        }
    }
})