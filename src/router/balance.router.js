const Router = require('koa-router')
const { verifyAuth } = require('../middleware/auth.middleware')
const { getBalance, getUserRecord, getUserRecordTotal, createPayPassword, updatePayPassword, recharge, withdraw } = require('../controller/balance.controller')
const balanceRouter = new Router({ prefix: '/balance' })
//获取用户余额
balanceRouter.get('/getBalance', verifyAuth, getBalance)
//获取用户余额记录
balanceRouter.get('/getUserRecord/:uid', verifyAuth, getUserRecord)
//获取用户余额记录总数
balanceRouter.get('/getUserRecordTotal/:uid', verifyAuth, getUserRecordTotal)
//设置和修改支付密码
balanceRouter.post('/createPayPassword', verifyAuth, createPayPassword)
balanceRouter.post('/updatePayPassword', verifyAuth, updatePayPassword)
//充值
balanceRouter.post('/recharge', verifyAuth, recharge)
balanceRouter.post('/withdraw', verifyAuth, withdraw)
module.exports = balanceRouter
