const errorType = require('../constants/error-types')
const service = require('../service/user.service')
const { md5password } = require('../utils/password.handle')
/*验证用户注册*/
const verifyUser = async (ctx, next) => {
    //获取用户名和密码
    const { username, password } = ctx.request.body
    //判断用户名或密码不能为空
    if (!username || !password) {
        const err = new Error(errorType.NAME_OR_PASSWORD_IS_REQUIRED)
        return ctx.app.emit('error', error, ctx)
    }
    //判断用户名没有被注册过
    const result = await service.getUserByUserame(username)
    console.log(result)
    if (result.length) {
        const error = new Error(errorType.USER_ALREADY_EXISTS)
        return ctx.app.emit('error', error, ctx)
    }

    await next()
}
/* 对用户密码进行加密 */
const handlePassword = async (ctx, next) => {
    const { password } = ctx.request.body
    ctx.request.body.password = md5password(password)

    await next()
}


module.exports = {
    verifyUser,
    handlePassword
}