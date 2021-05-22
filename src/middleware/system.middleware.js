const systemService = require('../service/system.service')
const taskService = require('../service/task.service')
const balanceService = require('../service/balance.service')
const { changeUTC } = require('../utils/time.handle')
const moment = require('moment')
//检测闲置任务是否过期，过期则改变状态,返还预付金
const checkExpirationTime = async () => {
    //获取所有闲置任务
    const result = await systemService.getAllFreeTask()
    if(result.length === 0) {
        return
    }
    for(item of result) {
        if(changeUTC(item.expiration_time) <= moment().format('YYYY-MM-DD HH:mm:ss')) {
            //闲置任务过期，改变状态
            await systemService.updateFreeTaskStatus(item.tid)
            //返还预付金
             //1.获取预付金记录，2.获取发布用户余额，3.更新用户余额
             const { advance } = await taskService.getAdvance(item.task_number, item.owner_id)
             const { balance } = await balanceService.getUserBalance(item.owner_id)
             const new_balance = FloatAdd(parseFloat(balance), parseFloat(advance))
             await balanceService.updateUserBalance(parseFloat(new_balance), item.owner_id)
             //4.生成余额记录
             await balanceService.createBalanceRecord(5, parseFloat(advance), item.owner_id)
        }
    }
}
module.exports = {
    checkExpirationTime
}