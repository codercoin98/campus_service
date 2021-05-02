const jwt = require('jsonwebtoken')
const { md5password } = require('../utils/password.handle')
const { PRIVATE_KEY } = require('../app/config')
const adminService = require('../service/admin.service')
class adminController {
    //管理员登录
    async login (ctx, next) {
        let { username, password } = ctx.request.body
        password = md5password(password)
        //校验密码是否正确
        const admin = await adminService.getAdmin(1)
        console.log(admin)
        if (username !== admin.admin_account) {
            const message = 'ACCOUNT_NOT_MATCH'
            ctx.body = { message }
        } else if (password !== admin.admin_password) {
            const message = 'PASSWORD_WRONG'
            ctx.body = { message }
        } else {
            //验证通过，颁发token
            const admin_id = admin.admin_id
            const token = jwt.sign({ admin_id, username }, PRIVATE_KEY, {
                //token有效时间(s)
                expiresIn: 60 * 60 * 24,
                //采用的加密算法
                algorithm: 'RS256'
            })
            ctx.body = { admin_id, token }
        }
    }
    //修改密码
    async editPassword (ctx, next) {
        const { old_password, new_password } = ctx.request.body
        //检查旧密码是否一致
        const res = await adminService.getAdmin(1)
        console.log(res)
        if (md5password(old_password) !== res.admin_password) {
            //密码错误
            const message = 'PASSWORD_WRONG'
            ctx.body = { message }
        } else {
            const result = await adminService.updateAdminPassword(res.admin_account, md5password(new_password))
            console.log(result)
            if (result.affectedRows === 1) {
                const message = 'UPDATE_SUCCESS'
                ctx.body = { message }
            } else {
                const message = 'UPDATE_FAIL'
                ctx.body = { message }
            }
        }


    }
    //获取所有用户信息
    async getAllUser (ctx, next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getAllUser(pageNo, pageSize)
        ctx.body = result
    }
    //通过用户名查找用户
    async getUserByUsername (ctx, next) {
        const username = ctx.request.query.username
        const result = await adminService.getUserByUsername(username)
        ctx.body = result
    }
    //禁用用户
    async forbiddenUser (ctx, next) {
        const { uid, username, reason, type } = ctx.request.body
        const result = await adminService.forbiddenUser(uid, username, reason, parseInt(type))
        if (result.affectedRows === 1) {
            //成功
            const statusCode = 200
            ctx.body = {
                statusCode
            }
        } else {
            const statusCode = 500
            ctx.body = {
                statusCode
            }
        }
    }
    //获取禁用用户
    async getForbiddenUser (ctx, next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getForbiddenUser(pageNo, pageSize)
        console.log(result)
        ctx.body = result
    }
    //解除用户禁用
    async releaseUser (ctx, next) {
        const { username } = ctx.request.body
        //修改用户禁用状态
        const result = await adminService.releaseUser(username)
        //修改用户禁用记录为已解除
        await adminService.changeForbiddenStatus(username)
        if (result.affectedRows === 1) {
            //成功
            const statusCode = 200
            ctx.body = {
                statusCode
            }
        } else {
            //失败
            const statusCode = 500
            ctx.body = {
                statusCode
            }
        }
    }
    //回复用户投诉
    async replyComplaint (ctx, next) {
        const { complaint_id, reply, reply_at } = ctx.request.body
        const result = await adminService.replyComplaint(complaint_id, reply, reply_at)
        if (result.affectedRows === 1) {
            //成功
            const statusCode = 200
            ctx.body = {
                statusCode
            }
        } else {
            //失败
            const statusCode = 500
            ctx.body = {
                statusCode
            }
        }
    }
    //获取对应页码的已受理的用户投诉
    async getComplaintInfo (ctx, next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getComplaintInfo(pageNo, pageSize)
        ctx.body = result
    }
    //获取新提交的用户投诉
    async getNewComplaintInfo (ctx, next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getNewComplaintInfo(pageNo, pageSize)
        ctx.body = result
    }
    //获取代跑任务
    async getTaskInfo (ctx, next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getTaskInfo(pageNo, pageSize)
        ctx.body = result
    }
    //获取已处理的学生认证信息
    async getStudentInfo (ctx, next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getStudentInfo(pageNo, pageSize)
        ctx.body = result
    }
    //获取待审核的学生信息
    async getNewStudentInfo (ctx, next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getNewStudentInfo(pageNo, pageSize)
        ctx.body = result
    }
    //审核学生信息
    async handlePassAndReject (ctx, next) {
        const { uid, status } = ctx.request.body
        //改变用户权限
        await adminService.updateUserRight(uid)
        const result = await adminService.handlePassAndReject(uid, status)
        if (result.affectedRows === 1) {
            const statusCode = 200
            ctx.body = {
                statusCode
            }
        } else {
            const statusCode = 500
            ctx.body = {
                statusCode
            }
        }
    }
    //获取用户账户流水
    async getBalanceInfo (ctx, next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getBalanceInfo(pageNo, pageSize)
        ctx.body = result
    }
    //获取全部用户学生认证信息
    async getAllStudentInfo (ctx, next) {
        const result = await adminService.getAllStudentInfo()
        ctx.body = result
    }
    //获取全部的用户信息
    async getAllUserInfo (ctx, next) {
        const result = await adminService.getAllUserInfo()
        ctx.body = result
    }
    //获取全部任务信息
    async getAllTaskInfo (ctx, next) {
        const result = await adminService.getAllTaskInfo()
        ctx.body = result
    }
    //获取全部流水信息
    async getAllBalanceInfo (ctx, next) {
        const result = await adminService.getAllBalanceInfo()
        ctx.body = result
    }
    //获取所有已受理的投诉记录数
    async getComplaintTotal (ctx, next) {
        const result = await adminService.getComplaintTotal()
        ctx.body = result
    }
    //获取新的待处理的投诉记录
    async getNewComplaintTotal (ctx, next) {
        const result = await adminService.getNewComplaintTotal()
        ctx.body = result
    }
    //获取待审核学生信息条数
    async getNewStudentTotal (ctx, next) {
        const result = await adminService.getNewStudentTotal()
        ctx.body = result
    }
    //获取学生信息条数
    async getStudentTotal (ctx, next) {
        const result = await adminService.getStudentTotal()
        ctx.body = result
    }
    //获取用户信息条数
    async getUserTotal (ctx, next) {
        const result = await adminService.getUserTotal()
        ctx.body = result
    }
    //获取任务信息条数
    async getTaskTotal (ctx, next) {
        const result = await adminService.getTaskTotal()
        ctx.body = result
    }
    //获取全部账户流水信息条数
    async getBalanceTotal (ctx, next) {
        const result = await adminService.getBalanceTotal()
        ctx.body = result
    }
    //查找用户
    async searchUser (ctx, next) {
        const keyword = ctx.request.query.keyword
        const region = ctx.request.query.region
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.searchUser(keyword, region, pageNo, pageSize)
        console.log(result)
        ctx.body = result
    }
    //按类型获取账户流水
    async searchBalance (ctx, next) {
        const type = parseInt(ctx.request.query.type)
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.searchBalance(type, pageNo, pageSize)
        ctx.body = result
    }
    //查找学生信息
    async searchStudent (ctx, next) {
        const university = ctx.request.query.university
        let status = parseInt(ctx.request.query.status)
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        console.log(ctx.request.query)
        if (status) {
            status = parseInt(status)
        } else {
            status = 3
        }
        const result = await adminService.searchStudent(university, status, pageNo, pageSize)
        ctx.body = result
    }
    //查找任务信息
    async searchTask (ctx, next) {
        const type = ctx.request.query.type
        const status = parseInt(ctx.request.query.status)
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.searchTask(type, status, pageNo, pageSize)
        ctx.body = result
    }
}

module.exports = new adminController()