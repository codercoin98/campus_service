/* 处理用户注册登录等逻辑 */
const fs = require('fs')
const userService = require('../service/user.service')
const fileService = require('../service/file.service')
const errorType = require('../constants/error-types')
const { TimeHandler } = require('../utils/time.handle')
const { AVATAR_PATH } = require('../constants/filePath')
const { md5password } = require('../utils/password.handle')
class UserController {
    //用户注册
    async register (ctx, next) {
        //获取用户请求传递的参数
        const user = ctx.request.body
        //操作数据库
        const result = await userService.register(user)
        //返回数据
        ctx.body = result
    }
    //用户邮箱注册
    //用户提交邮箱注册信息
    async emailRegister (ctx, next) {
        //获取用户提交数据
        const { username, password, verifyCode } = ctx.request.body
        //获取验证码信息
        const { code } = await userService.getVerifyCode(username)
        if (code) {
            //验证码未失效
            if (verifyCode === code) {
                //检查邮箱是否已经被使用
                const userResult = await userService.getUserByUserame(username)
                if (userResult) {
                    //邮箱已经被使用已经存在
                    const error = new Error(errorType.USER_ALREADY_EXISTS)
                    return ctx.app.emit('error', error, ctx)
                }
                //验证通过，保存新用户信息
                const user = {
                    username: username,
                    password: password
                }
                const res = await userService.register(user)
                if (res.affectedRows === 1) {
                    const message = 'REGISTER_SUCCESS'
                    const statusCode = 200
                    ctx.body = {
                        message, statusCode
                    }
                } else {
                    const message = 'REGISTER_FAIL'
                    const statusCode = 500
                    ctx.body = {
                        message, statusCode
                    }
                }
            } else {
                //验证码错误
                const message = 'VERIFY_CODE_NOT_MATCH'
                const statusCode = 301
                ctx.body = {
                    message, statusCode
                }
            }
        } else {
            //验证码过期
            const message = 'OVERDUE_VERIFY'
            const statusCode = 302
            ctx.body = {
                message, statusCode
            }
        }

    }
    //根据id获取用户信息
    async getUserByUid (ctx, next) {
        //获取用户请求的携带的用户名
        const uid = ctx.request.query.uid
        //操作数据库并处理返回的数据
        const result = await userService.getUserByUid(uid)
        if (result.brithday) {
            result.brithday = TimeHandler(result.brithday)
        }
        //返回数据
        ctx.body = result
    }

    //根据用户id获取对应头像
    async getAvatarInfo (ctx, next) {
        //获取用户id
        const userId = ctx.request.params.id

        const avatarInfo = await fileService.getAvatarByUserId(userId)

        //返回图片信息,设置响应类型，否则图片会被直接下载
        ctx.response.set('content-type', avatarInfo[0].mimetype)
        ctx.body = fs.createReadStream(`${AVATAR_PATH}/${avatarInfo[0].filename}`)

    }
    //获取用户禁用信息
    async getUserForbiddenInfo (ctx, next) {
        //获取用户id
        const uid = parseInt(ctx.request.query.uid)

        const result = await userService.getUserForbiddenInfo(uid)
        console.log(result)
        ctx.body = result
    }
    //更新用户信息
    async updateUserInfo (ctx, next) {
        //1.获取用户提交的信息
        const userUpdateInfo = ctx.request.body
        //2.处理生日的数据类型
        if (userUpdateInfo.brithday) {
            userUpdateInfo.brithday = TimeHandler(userUpdateInfo.brithday)
        }
        console.log(ctx.request.body)
        //3.将用户提交的信息更新至数据库
        const result = await userService.updateUserInfo(userUpdateInfo.username, userUpdateInfo.nickname, userUpdateInfo.gender, userUpdateInfo.telephone, userUpdateInfo.brithday)
        //返回结果
        if (result.affectedRows === 1) {
            const successMessage = 'UPDATE_SUCCESS'
            const statusCode = 200
            ctx.body = { successMessage, statusCode }
        } else {
            const failMessage = 'UPDATE_FAIL'
            const statusCode = 500
            ctx.body = { failMessage, statusCode }
        }

    }
    //修改密码
    async updatePassword (ctx, next) {
        const { uid, password, new_password } = ctx.request.body
        //校验旧密码
        const res = await userService.getUserOldPassword(uid)
        if (password === res.password) {
            //密码校验通过，修改密码
            const new_pwd = md5password(new_password)
            const result = await userService.updatePassword(uid, new_pwd)
            if (result.affectedRows === 1) {
                //更新成功
                const message = 'UPDATE_SUCCESS'
                const statusCode = 200
                ctx.body = {
                    message, statusCode
                }
            } else {
                const message = 'UPDATE_FAIL'
                const statusCode = 500
                ctx.body = {
                    message, statusCode
                }
            }
        } else {
            //密码不匹配
            const message = 'PASSWORD_NOT_MATCH'
            const statusCode = 500
            ctx.body = {
                message, statusCode
            }
        }
    }
    //获取用户权限
    async getUserRightByUsername (ctx, next) {
        //获取用户名
        const username = ctx.request.query.username
        //查询数据库
        const result = await userService.getUserRightByUsername(username)
        //返回结果
        ctx.body = result
    }
    //获取用户余额和支付密码
    async getUserBalanceAndPayPasswordByUid (ctx, next) {
        //获取用户id
        const uid = ctx.request.query.uid
        //查询数据库
        const result = await userService.getUserBalanceAndPayPasswordByUid(uid)
        //返回结果
        ctx.body = result
    }
    //通过uid查找用户学生信息认证状态
    async getVerifyStatusByUid (ctx, next) {
        //查看是否有记录
        const uid = ctx.request.query.uid
        const SelectResult = await userService.selectStudentInfoByUid(uid)
        if (SelectResult) {
            //有记录，则获取学生信息认证状态
            const result = await userService.getVerifyStatusByUid(uid)
            ctx.body = result
        } else {
            //没有记录
            const audit_status = null
            ctx.body = audit_status
        }
    }
    //保存用户提交的学生信息
    async saveStudentInfo (ctx, next) {
        //获取用户提交的学生信息
        console.log(ctx.request.body)

        const user_studentInfo = ctx.request.body
        //查询数据库有没有记录，有则返回结果，无则继续操作
        const SelectResult = await userService.selectStudentInfoByUid(parseInt(user_studentInfo.uid))
        if (SelectResult) {
            //已有记录
            const message = 'HAVE_STUDENTINFO'
            const statusCode = 500
            ctx.body = {
                message, statusCode
            }

            return
        }
        //插入数据库
        const result = await userService.saveStudentInfo(user_studentInfo)
        //返回结果
        if (result.affectedRows === 1) {
            //插入成功
            const message = 'SUCCESS'
            const statusCode = 200
            ctx.body = {
                message, statusCode
            }
        } else {
            const message = 'FAIL'
            const statusCode = 500
            ctx.body = {
                message, statusCode
            }
        }
    }
    //获取用户收件地址
    async getUserAddress (ctx, next) {
        const uid = ctx.request.query.uid
        const result = await userService.getUserAddress(uid)
        ctx.body = result
    }
    //新增用户收件地址
    async addAddress (ctx, next) {

        const user_address = ctx.request.body
        //处理数据
        if (user_address.isDefault === true) {
            user_address.isDefault = 1
        } else {
            user_address.isDefault = 0
        }
        user_address.uid = parseInt(user_address.uid)
        if (user_address.isDefault === 1) {
            //判断是否已存在默认地址
            const res = await userService.checkDefault(user_address.uid)
            if (res.length === 0) {
                //用户没有旧的默认地址
                //插入数据库
                const result = await userService.addAddress(user_address)
                //返回结果
                if (result.affectedRows === 1) {
                    const successMessage = 'ADD_SUCCESS'
                    const statusCode = 200
                    ctx.body = { successMessage, statusCode }
                } else {
                    const failMessage = 'ADD_FAIL'
                    const statusCode = 500
                    ctx.body = { failMessage, statusCode }
                }
            } else {
                //已经存在默认地址，将旧的默认地址改变为非默认，再插入数据库
                await userService.changeDefaultAddress(user_address.uid)
                //插入数据库
                const result = await userService.addAddress(user_address)
                //返回结果
                if (result.affectedRows === 1) {
                    const successMessage = 'ADD_SUCCESS'
                    const statusCode = 200
                    ctx.body = { successMessage, statusCode }
                } else {
                    const failMessage = 'ADD_FAIL'
                    const statusCode = 500
                    ctx.body = { failMessage, statusCode }
                }
            }
        } else {
            //插入数据库
            const result = await userService.addAddress(user_address)
            //返回结果
            if (result.affectedRows === 1) {
                const successMessage = 'ADD_SUCCESS'
                const statusCode = 200
                ctx.body = { successMessage, statusCode }
            } else {
                const failMessage = 'ADD_FAIL'
                const statusCode = 500
                ctx.body = { failMessage, statusCode }
            }
        }
    }
    //修改用户地址
    async updateAddress (ctx, next) {

        const user_address = ctx.request.body
        user_address.isDefault === true ? user_address.isDefault = 1 : user_address.isDefault = 0
        //处理数据
        if (user_address.isDefault === 1) {
            //判断是否已存在默认地址
            const res = await userService.checkDefault(user_address.user_id)
            if (res.length === 0) {
                //用户没有旧的默认地址
                //更新数据库
                const result = await userService.updateAddress(user_address)
                //返回结果
                if (result.affectedRows === 1) {
                    const successMessage = 'UPDATE_SUCCESS'
                    ctx.body = { successMessage }
                } else {
                    const failMessage = 'UPDATE_FAIL'
                    ctx.body = { failMessage }
                }
            } else {
                //用户有旧的默认地址先将旧的默认地址置为非默认
                await userService.changeDefaultAddress(user_address.user_id)
                //更新地址
                const result = await userService.updateAddress(user_address)
                //返回结果
                if (result.affectedRows === 1) {
                    const successMessage = 'UPDATE_SUCCESS'
                    ctx.body = { successMessage }
                } else {
                    const failMessage = 'UPDATE_FAIL'
                    ctx.body = { failMessage }
                }
            }
        } else {
            //更新数据库
            const result = await userService.updateAddress(user_address)
            //返回结果
            if (result.affectedRows === 1) {
                const successMessage = 'UPDATE_SUCCESS'
                ctx.body = { successMessage }
            } else {
                const failMessage = 'UPDATE_FAIL'
                ctx.body = { failMessage }
            }
        }
    }
    //改变默认收件地址
    async changeDefaultAddress (ctx, next) {
        const { default_address_id, user_id } = ctx.request.body
        //改变默认地址
        const result = await userService.changeDefaultAddress(default_address_id, user_id)

        //返回结果
        if (result.affectedRows === 1) {
            const successMessage = 'UPDATE_SUCCESS'
            const statusCode = 200
            ctx.body = { successMessage, statusCode }
        } else {
            const failMessage = 'UPDATE_FAIL'
            const statusCode = 500
            ctx.body = { failMessage, statusCode }
        }
    }
    //通过任务id获取代跑用户
    async getReceiver (ctx, next) {
        const tid = parseInt(ctx.request.query.tid)
        //通过tid查找代跑用户
        const { receiver_id } = await userService.getReceiver(tid)
        //获取代跑用户信息
        const receiver_info = await userService.getUserByUid(receiver_id)

        ctx.body = receiver_info
    }
    //获取用户所在学校
    async getUserUniversity (ctx, next) {
        const uid = parseInt(ctx.request.params.uid)
        const result = await userService.getUserUniversity(uid)
        ctx.body = result
    }
    //获取用户信誉分
    async getUserCreditPoints (ctx, next) {
        const uid = parseInt(ctx.request.params.uid)
        const result = await userService.getCreditPoints(uid)
        ctx.body = result
    }
}

module.exports = new UserController()