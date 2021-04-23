const Router = require('koa-router')
const { verifyAuth } = require('../middleware/auth.middleware')
const { getBalance, createPayPassword, updatePayPassword, recharge, withdraw } = require('../controller/balance.controller')
const balanceRouter = new Router({ prefix: '/balance' })
//获取用户余额
balanceRouter.get('/getBalance', verifyAuth, getBalance)
//设置和修改支付密码
balanceRouter.post('/createPayPassword', verifyAuth, createPayPassword)
balanceRouter.post('/updatePayPassword', verifyAuth, updatePayPassword)
//充值
balanceRouter.post('/recharge', verifyAuth, recharge)
balanceRouter.post('/withdraw', verifyAuth, withdraw)
module.exports = balanceRouter
