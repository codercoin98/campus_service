const Router = require('koa-router')
const { login } = require('../controller/admin.controller')
const adminRouter = new Router({ prefix: '/admin' })
adminRouter.post('/login',login)
module.exports = adminRouter