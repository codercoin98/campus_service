const fs = require('fs')
const { createTaskNumber, createFileUrl, transferAccounts } = require('../middleware/task.middleware')
const balanceService = require('../service/balance.service')
const taskService = require('../service/task.service')
const { FloatAdd, FloatSub } = require('../utils/balance.handle')
const { changeUTC } = require('../utils/time.handle')
const { TASK_FILE_PATH } = require('../constants/filePath')
const userService = require('../service/user.service')
const { checkExpirationTime } = require('../middleware/system.middleware')
class TaskController {
    //发布任务
    async releaseTask (ctx, next) {
        //获取任务信息
        const task = ctx.request.body
        console.log(task)
        //更改数据类型
        task.uid = parseInt(task.uid)
        if (task.copies) {
            task.copies = parseInt(task.copies)
        }
        if (task.estimated_amount) {
            task.estimated_amount = parseFloat(task.estimated_amount)
        }
        task.commission = parseFloat(task.commission)
        //为任务添加任务编号
        task.task_number = createTaskNumber(task.uid)
        let filenmaeList = []
        //获取上传文件的文件名,文件类型，任务编号，发布用户id
        for (let key in ctx.request.files) {
            const arr = ctx.request.files[key].path.split('\\')
            const filename = arr[5].split('.')[0]
            const mimetype = ctx.request.files[key].type
            const task_number = task.task_number
            const uid = task.uid
            //插入数据库
            await taskService.createTaskFile(filename, mimetype, task_number, uid)
            // console.log(filename)
            filenmaeList.push(filename)
            // console.log(ctx.request.files[key].path)
        }
        //生成上传文件的地址（实际为一个接口）
        task.upload_file_url = createFileUrl(filenmaeList)
        // 插入数据库
        const result = await taskService.saveTask(task)
        //返回结果
        if (result.affectedRows === 1) {
            //任务发布成功
            //生成预付款记录,代取快递没有预付金
            let advance = 0
            if (task.copies || task.estimated_amount) {
                advance = FloatAdd(task.estimated_amount, task.commission)
            } else {
                advance = task.commission
            }
            await balanceService.createAdvance(task.uid, task.task_number, advance)
            //对用户余额进行更改
            const { balance } = await balanceService.getUserBalance(task.uid)
            const new_balance = FloatSub(parseFloat(balance), parseFloat(advance))
            const updateRes = await balanceService.updateUserBalance(parseFloat(new_balance), task.uid)
            //生成余额记录-类型为3：任务支出
            const type = 3
            await balanceService.createBalanceRecord(type, advance, task.uid)
            //更改成功
            if (updateRes.affectedRows === 1) {
                //返回结果
                const message = 'RELEASE_SUCCESS'
                const statusCode = 200
                ctx.body = {
                    message, statusCode
                }
            } else {
                const message = 'UPDATE_BALANCE_FAIL'
                const statusCode = 500
                ctx.body = {
                    message, statusCode
                }
            }
        } else {
            const message = 'RELEASE_FAIL'
            const statusCode = 500
            ctx.body = {
                message, statusCode
            }
        }

    }

    //获取用户已发布的任务,获取用户已接取的任务
    async getUserTaskList (ctx, next) {
        checkExpirationTime()
        let { list_type, type, status, uid } = ctx.request.query
        list_type = parseInt(list_type)
        type = parseInt(type)
        status = parseInt(status)
        uid = parseInt(uid)
        //根据不同的条件进行查询
        if (list_type === 0) {
            //用户发布的任务
            const result = await taskService.getUserReleaseTaskList(type, status, uid)
            ctx.body = result
        } else if (list_type === 1) {
            //用户发布的任务
            const result = await taskService.getUserReceiveTaskList(type, status, uid)
            ctx.body = result
        }
    }
    //获取任务详情
    async getTaskDetails (ctx, next) {
        const tid = ctx.request.query.tid

        const details = await taskService.getTaskDetails(tid)
        details.createAt = changeUTC(details.createAt)
        ctx.body = details
    }
    //获取任务进程信息
    async getReceiveTaskProcess (ctx, next) {
        const tid = ctx.request.query.tid
        const result = await taskService.getReceiveTaskProcess(tid)
        result.obtain_delivery_at = changeUTC(result.obtain_delivery_at)
        result.printed_at = changeUTC(result.printed_at)
        result.bought_at = changeUTC(result.bought_at)
        result.is_sending_at = changeUTC(result.is_sending_at)
        result.arrived_at = changeUTC(result.arrived_at)
        result.receiver_confirm_at = changeUTC(result.receiver_confirm_at)
        result.releaser_confirm_at = changeUTC(result.releaser_confirm_at)
        result.createAt = changeUTC(result.createAt)
        ctx.body = result
    }
    //获取任务文件
    async getTaskFiles (ctx, next) {
        const filename = ctx.request.params.filename
        //获取文件类型
        const result = await taskService.getTaskFileType(filename)
        //返回文件信息,设置响应类型
        ctx.response.set('content-type', result.mimetype)
        ctx.body = fs.createReadStream(`${TASK_FILE_PATH}/${filename}`)
    }
    //更新任务状态
    async updateTaskStatus (ctx, next) {
        const { tid, status } = ctx.request.body

        const result = await taskService.updateTaskStatus(tid, status)

        if (result.affectedRows === 1) {
            //更新成功
            const message = 'UPDATE_SUCCESS'
            const statusCode = 200
            ctx.body = { message, statusCode }
        } else {
            const message = 'UPDATE_FAIL'
            const statusCode = 500
            ctx.body = { message, statusCode }
        }

    }
    //获取最新任务
    async getTaskList (ctx, next) {
        let type = parseInt(ctx.request.query.type)
        let sortord = parseInt(ctx.request.query.sortord)
        const uid = parseInt(ctx.request.query.uid)
        //1.获取用户的学校
        const { university_name } = await userService.getUserUniversity(uid)
        //2.获取对应学校用户发布的任务
        //按任务类型返回数据,0为代取快递，1为代打印，2为代购物，3为其他代跑
        switch (type) {
            case 0:
                type = '代取快递'
                break
            case 1:
                type = '代打印'
                break
            case 2:
                type = '代购物'
                break
            case 3:
                type = '其他代跑'
                break
            default:
                break
        }
        //按排序返回数据,0最新，1按任务金从高到底，2按有效时间从长到短
        switch (sortord) {
            case 0:
                sortord = 'createAt'
                break
            case 1:
                sortord = 'commission'
                break
            case 2:
                sortord = 'expiration_time'
                break
            default:
                break
        }
        checkExpirationTime()
        const result = await taskService.getLatestTask(type, sortord, uid, university_name)
        ctx.body = result
    }

    //用户接取任务
    async receiveTask (ctx, next) {
        const { tid, owner_id, receiver_id } = ctx.request.body
        //生成用户接取记录
        const result = await taskService.createReceiveRecord(tid, receiver_id)
        //生成任务代跑进程
        const result2 = await taskService.createReceiveProcess(tid, owner_id, receiver_id)
        if (result.affectedRows === 1 && result2.affectedRows === 1) {
            //生成记录成功，更改任务状态为已接取
            await taskService.updateTaskStatus(tid, 2)
            const message = 'RECEIVE_SUCCESS'
            const statusCode = 200
            ctx.body = { message, statusCode }
        } else {
            //生成记录失败
            const message = 'RECEIVE_FAIL'
            const statusCode = 500
            ctx.body = { message, statusCode }
        }
    }
    //改变进程状态
    async changeProcess (ctx, next) {
        const { status, process_id } = ctx.request.body
        const result = await taskService.changeProcess(status, process_id)
        //用户确认完成，任务结束，改变任务状态
        if (status === 'releaser_confirm') {
            //通过进程id获取任务id,发布用户id,代跑用户id,
            const { tid, releaser_id, receiver_id } = await taskService.getTaskIds(process_id)
            const status = 3
            await taskService.updateTaskStatus(tid, status)
            //将任务金和预估金转入代跑用户账户
            await transferAccounts(tid, releaser_id, receiver_id)
        }
        if (result.affectedRows === 1) {
            const message = 'UPDATE_SUCCESS'
            const statusCode = 200
            ctx.body = { message, statusCode }
        } else {
            const message = 'UPDATE_FAIL'
            const statusCode = 500
            ctx.body = { message, statusCode }
        }

    }
    //提交任务评价
    async submitComment (ctx, next) {
        const { receiver_id, releaser_id, task_number, rate, content } = ctx.request.body
        console.log(receiver_id, releaser_id, task_number, rate, content)
        //插入评论表
        const res = await taskService.saveCommnet(receiver_id, releaser_id, task_number, rate, content)

        if (res.affectedRows === 1) {
            //插入成功,改变代跑用户的信誉分
            //先获取对应用户的信誉分
            const { credit_points } = await userService.getCreditPoints(receiver_id)

            const new_credit_points = credit_points + rate

            await userService.updateCreditPoints(receiver_id, new_credit_points)
            const message = 'COMMENT_SUCCESS'
            ctx.body = { message }

        } else {
            //插入失败
            const message = 'COMMENT_FAIL'
            ctx.body = { message }
        }
    }
    //获取评价
    async getTaskComment (ctx, next) {
        const task_number = parseInt(ctx.request.query.task_number)
        const releaser_id = parseInt(ctx.request.query.releaser_id)
        const comment = await taskService.getComment(task_number, releaser_id)
        console.log(comment)
        if (comment === undefined) {
            ctx.body = null
        } else {
            ctx.body = comment
        }
    }
    //提交投诉
    async submitComplaint (ctx, next) {
        const { task_number, receiver_id, content, user_id } = ctx.request.body
        //保存早数据库
        const result = await taskService.saveComplaint(task_number, receiver_id, content, user_id)

        if (result.affectedRows === 1) {
            const message = 'SUBMIT_SUCCESS'
            ctx.body = { message }
        } else {
            const message = 'SUBMIT_FAIL'
            ctx.body = { message }
        }
    }
    //获取任务评价状态
    async getCommentStatus (ctx, next) {
        const task_number = parseInt(ctx.request.query.task_number)
        const uid = parseInt(ctx.request.query.uid)

        const { num } = await taskService.getCommentStatus(task_number, uid)
        ctx.body = {
            num: num
        }
    }
    //获取任务投诉状态
    async getComplaintStatus (ctx, next) {
        const task_number = parseInt(ctx.request.query.task_number)
        const uid = parseInt(ctx.request.query.uid)

        const { num } = await taskService.getComplaint(task_number, uid)
        ctx.body = {
            num: num
        }
    }
}
module.exports = new TaskController()