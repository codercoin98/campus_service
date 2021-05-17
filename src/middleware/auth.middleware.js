const jwt = require('jsonwebtoken')
const errorType = require('../constants/error-types')
const service = require('../service/user.service')
const { md5password } = require('../utils/password.handle')
const { PUBLIC_KEY } = require('../app/config')
/* 校验登录 */
const verifyLogin = async (ctx, next) => {
    //1.获取用户名和密码
    const { username, password } = ctx.request.body
    //2.判断用户名和密码是否为空
    if (!username || !password) {
        const err = new Error(errorType.NAME_OR_PASSWORD_IS_REQUIRED)
        return ctx.app.emit('error', error, ctx)
    }
    //3.判断用户是否存在
    const result = await service.getUserByUserame(username)
    const user = result[0]
    if (!user || user === undefined) {
        const error = new Error(errorType.USER_DOES_NOT_EXISTS)
        return ctx.app.emit('error', error, ctx)
    }
    //4.判断密码是否和数据库中的密码一致（加密处理）
    if (md5password(password) !== user.password) {
        const error = new Error(errorType.PASSWORD_IS_INCORENT)
        return ctx.app.emit('error', error, ctx)
    }

    ctx.user = user

    await next()

}
/* 验证用户Token */
const verifyAuth = async (ctx, next) => {
    //1.获取token
    const token = ctx.headers.authorization
    // const token = authorization.replace('Bearer', '')
    //2.使用公钥验证token,捕获错误
    try {
        const result = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ['RS256']
        })
        // console.log(result)
        if (result.exp === result.iat) {
            const error = new Error(errorType.EXPIRATION_TOKEN)
            return ctx.app.emit('error', error, ctx)
        }
        ctx.user = result
        await next()
    } catch (err) {
        console.log(err)
        const error = new Error(errorType.UNAUTHORIZATION)
        return ctx.app.emit('error', error, ctx)
    }

}

/* 延迟函数，用于删除过期验证码 */
const delay = (time, email) => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            await service.deleteCode(email)
            resolve()
        }, time)
    })
}

module.exports = {
    verifyLogin,
    verifyAuth,
    delay
}