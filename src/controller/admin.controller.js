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
        const { uid,username, reason, type } = ctx.request.body
        const result = await adminService.forbiddenUser(uid, username,reason, parseInt(type))
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
        const {username} = ctx.request.body
        //修改用户禁用状态
        const result = await adminService.releaseUser(username)
        //修改用户禁用记录为已解除
        await adminService.changeForbiddenStatus(username)
        if(result.affectedRows === 1) {
              //成功
              const statusCode = 200
              ctx.body = {
                  statusCode
              }
        }else {
              //成功
              const statusCode = 500
              ctx.body = {
                  statusCode
              }
        }
    }
    //获取用户投诉
    async getComplainInfo(ctx,next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getComplainInfo(pageNo, pageSize)
        ctx.body = result
    }
    //获取代跑任务
    async getTaskInfo(ctx,next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getTaskInfo(pageNo, pageSize)
        ctx.body = result
    }
    //获取学生认证信息
    async getStudentInfo(ctx,next) {
        const pageNo = parseInt(ctx.request.query.pageNo)
        const pageSize = parseInt(ctx.request.query.pageSize)
        const result = await adminService.getStudentInfo(pageNo, pageSize)
        ctx.body = result
    }
}

module.exports = new adminController()