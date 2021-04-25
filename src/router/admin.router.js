const Router = require('koa-router')
const { login,
    getAllUser,
    getForbiddenUser,
    getUserByUsername,
    forbiddenUser,
    releaseUser,
    getComplainInfo,
    getTaskInfo,
    getStudentInfo } = require('../controller/admin.controller')
const { verifyAuth } = require('../middleware/auth.middleware')
const adminRouter = new Router({ prefix: '/admin' })

adminRouter.post('/login', login)

adminRouter.get('/getAllUser', verifyAuth, getAllUser)

adminRouter.get('/getForbiddenUser', verifyAuth, getForbiddenUser)

adminRouter.get('/getUserByUsername', verifyAuth, getUserByUsername)
//禁用用户
adminRouter.post('/forbiddenUser', verifyAuth, forbiddenUser)
//解除用户禁用
adminRouter.post('/releaseUser', verifyAuth, releaseUser)
//获取用户投诉
adminRouter.get('/getComplainInfo', verifyAuth, getComplainInfo)
//获取代跑任务
adminRouter.get('/getTaskInfo', verifyAuth, getTaskInfo)
//获取学生认证信息
adminRouter.get('/getStudentInfo', verifyAuth, getStudentInfo)
module.exports = adminRouter