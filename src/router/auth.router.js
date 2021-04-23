const Router = require('koa-router')
const { login, success, verifyPayPassword, getEmailCode } = require('../controller/auth.controller')
const { verifyLogin, verifyAuth } = require('../middleware/auth.middleware')
const authRouter = new Router({ prefix: '/user' })
//用户登录接口
authRouter.post('/login', verifyLogin, login)

//用户token验证接口
authRouter.get('/verifyToken', verifyAuth, success)

//校验用户支付密码
authRouter.post('/verifyPayPassword', verifyAuth, verifyPayPassword)

//用户邮箱注册，提交邮箱获取验证码
authRouter.post('/getEmailCode', getEmailCode)

module.exports = authRouter

