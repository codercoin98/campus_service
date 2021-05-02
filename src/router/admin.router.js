const Router = require('koa-router')
const { login,
    editPassword,
    getAllUser,
    getForbiddenUser,
    getUserByUsername,
    forbiddenUser,
    releaseUser,
    replyComplaint,
    getComplaintInfo,
    getNewComplaintInfo,
    getTaskInfo,
    getStudentInfo,
    getNewStudentInfo,
    handlePassAndReject,
    getComplaintTotal,
    getNewComplaintTotal,
    getStudentTotal,
    getNewStudentTotal,
    getUserTotal,
    getTaskTotal,
    getBalanceTotal,
    getBalanceInfo,
    searchBalance,
    getAllStudentInfo,
    getAllUserInfo,
    getAllTaskInfo,
    getAllBalanceInfo,
    searchUser,
    searchStudent,
    searchTask } = require('../controller/admin.controller')
const { verifyAuth } = require('../middleware/auth.middleware')
const adminRouter = new Router({ prefix: '/admin' })

adminRouter.post('/login', login)

adminRouter.post('/editPassword', verifyAuth, editPassword)
adminRouter.get('/getAllUser', verifyAuth, getAllUser)

adminRouter.get('/getForbiddenUser', verifyAuth, getForbiddenUser)

adminRouter.get('/getUserByUsername', verifyAuth, getUserByUsername)

/* 管理员操作 */
//禁用用户
adminRouter.post('/forbiddenUser', verifyAuth, forbiddenUser)
//解除用户禁用
adminRouter.post('/releaseUser', verifyAuth, releaseUser)
//回复受理
adminRouter.post('/replyComplaint',verifyAuth,replyComplaint)
//审核学生信息
adminRouter.post('/handlePassAndReject', verifyAuth, handlePassAndReject)


/* 分页查找 */
adminRouter.get('/getComplaintInfo', verifyAuth, getComplaintInfo)
adminRouter.get('/getNewComplaintInfo', verifyAuth, getNewComplaintInfo)
adminRouter.get('/getTaskInfo', verifyAuth, getTaskInfo)
adminRouter.get('/getStudentInfo', verifyAuth, getStudentInfo)
adminRouter.get('/getNewStudentInfo', verifyAuth, getNewStudentInfo)
adminRouter.get('/getBalanceInfo', verifyAuth, getBalanceInfo)

/* 表单的筛选查找 */
//查找用户
adminRouter.get('/searchUser', verifyAuth, searchUser)
//查找对应的流水记录
adminRouter.get('/searchBalance', verifyAuth, searchBalance)
//查找学生信息
adminRouter.get('/searchStudent', verifyAuth, searchStudent)
//查找任务信息
adminRouter.get('/searchTask', verifyAuth, searchTask)

/* 获取对应表的记录数 */
adminRouter.get('/getNewStudentTotal', verifyAuth, getNewStudentTotal)
adminRouter.get('/getNewComplaintTotal', verifyAuth, getNewComplaintTotal)
adminRouter.get('/getComplaintTotal', verifyAuth, getComplaintTotal)
adminRouter.get('/getNewStudentTotal', verifyAuth, getNewStudentTotal)
adminRouter.get('/getStudentTotal', verifyAuth, getStudentTotal)
adminRouter.get('/getUserTotal', verifyAuth, getUserTotal)
adminRouter.get('/getTaskTotal', verifyAuth, getTaskTotal)
adminRouter.get('/getBalanceTotal', verifyAuth, getBalanceTotal)


/* 数据可视化获取全部表的信息 */
adminRouter.get('/getAllStudentInfo', verifyAuth, getAllStudentInfo)
adminRouter.get('/getAllUserInfo', verifyAuth, getAllUserInfo)
adminRouter.get('/getAllTaskInfo', verifyAuth, getAllTaskInfo)
adminRouter.get('/getAllBalanceInfo', verifyAuth, getAllBalanceInfo)

module.exports = adminRouter