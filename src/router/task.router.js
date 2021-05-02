const path = require('path')
const Router = require('koa-router')
const koaBody = require('koa-body')
const { verifyAuth } = require('../middleware/auth.middleware')
const { releaseTask,
    getUserTaskList,
    getReceiveTaskProcess,
    getTaskDetails,
    getTaskFiles,
    updateTaskStatus,
    getTaskList,
    receiveTask,
    changeProcess,
    submitComment,
    getTaskCommentStatus,
    submitComplaint,
    getComplaintStatus } = require('../controller/task.controller')
const taskRouter = new Router({ prefix: '/task' })

//保存任务文件
const taskKoaBody = koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '../../uploads/task_file'),
        keepExtensions: false,
        maxFieldsSize: 20 * 1024 * 1024,
    }
})
//用户发布任务
taskRouter.post('/releaseTask', verifyAuth, taskKoaBody, releaseTask)
//用户获取自己发布的任务和接取的任务
taskRouter.get('/getUserTaskList', getUserTaskList)
//获取任务详情
taskRouter.get('/getTaskDetails', getTaskDetails)
//获取任务文件
taskRouter.get('/getTaskFile/:filename', getTaskFiles)
//获取任务进程
taskRouter.get('/getReceiveTaskProcess', getReceiveTaskProcess)
//更新任务状态
taskRouter.post('/updateTaskStatus', updateTaskStatus)

//获取最新任务
taskRouter.get('/getTaskList', getTaskList)

//用户接取任务
taskRouter.post('/receiveTask', receiveTask)

//改变进程状态
taskRouter.post('/changeProcess', changeProcess)

//用户提交任务评价
taskRouter.post('/submitComment', submitComment)
//获取评价状态
taskRouter.get('/getTaskCommentStatus',getTaskCommentStatus)
//用户提交投诉
taskRouter.post('/submitComplaint', verifyAuth, submitComplaint)
//获取任务投诉状态
taskRouter.get('/getComplaintStatus', getComplaintStatus)
module.exports = taskRouter