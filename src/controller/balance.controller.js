const balanceService = require('../service/balance.service')
const { FloatAdd, FloatSub } = require('../utils/balance.handle')
class BalanceController {
    //创建用户支付密码
    async createPayPassword (ctx, next) {
        //获取用户支付密码和用户id
        const { confirmPassword, uid } = ctx.request.body

        const user_id = parseInt(uid)
        //插入数据库
        const result = await balanceService.InsertPayPassword(confirmPassword, user_id)
        if (result.affectedRows === 1) {
            const message = 'INSERT_SUCCESS'
            const statusCode = 200
            ctx.body = {
                message,
                statusCode
            }
        } else {
            const message = 'INSERT_FAIL'
            const statusCode = 500
            ctx.body = {
                message,
                statusCode
            }
        }
    }
    //更新支付密码
    async updatePayPassword (ctx, next) {
        //获取新密码和旧密码
        const { oldPassword, newPassword, uid } = ctx.request.body

        //判断旧密码是否正确，正确则更新，不正确则报错
        const result = await balanceService.updatePayPassword(oldPassword, newPassword, uid)

        //返回结果
        if (result === 'WRONG_OLDPASSWORD') {
            //旧密码不匹配
            const message = result
            const statusCode = 500

            ctx.body = {
                message, statusCode
            }
        } else if (result.affectedRows === 1) {
            //更新成功
            const message = 'UPDATE_SUCCESS'
            const statusCode = 200
            ctx.body = {
                message, statusCode
            }
        }
    }
    //获取用户余额
    async getBalance (ctx, next) {
        const uid = ctx.request.query.uid
        const result = await balanceService.getUserBalance(uid)

        ctx.body = result
    }
    //用户充值
    async recharge (ctx, next) {
        const { recharge_value, pay_methods, uid } = ctx.request.body
        //处理数据
        const money = parseFloat(recharge_value)
        const user_id = parseInt(uid)
        //获取用户余额并更新
        const { balance } = await balanceService.getUserBalance(uid)
        const new_balance = FloatAdd(balance, money)
        const update_result = await balanceService.updateUserBalance(new_balance, uid)
        //更新成功则插入充值记录表，更新失败则报错
        if (update_result.affectedRows === 1) {
            //充值成功
            const message = 'RECHARGE_SUCCESS'
            const statusCode = 200
            ctx.body = {
                message, statusCode
            }
            //生成充值记录
            const type = 1
            await balanceService.recharge(type, money, pay_methods, user_id)
        } else {
            const message = 'RECHARGE_FAIL'
            const statusCode = 500
            ctx.body = {
                message, statusCode
            }
        }



    }
    //用户提现
    async withdraw (ctx, next) {
        const { withdraw_value, uid } = ctx.request.body
        //处理数据
        const new_withdraw_value = parseFloat(withdraw_value)
        const user_id = parseInt(uid)
        //获取用户余额并更新
        const { balance } = await balanceService.getUserBalance(uid)
        const new_balance = FloatSub(balance, new_withdraw_value)
        const update_result = await balanceService.updateUserBalance(new_balance, uid)
        //更新成功则插入充值记录表，更新失败则报错
        if (update_result.affectedRows === 1) {
            //充值成功
            const message = 'WITHDRAW_SUCCESS'
            const statusCode = 200
            ctx.body = {
                message, statusCode
            }
            //生成提现记录
            const type = 2
            await balanceService.withdraw(type, new_withdraw_value, user_id)
        } else {
            const message = 'WITHDRAW_FAIL'
            const statusCode = 500
            ctx.body = {
                message, statusCode
            }
        }

    }
}

module.exports = new BalanceController()