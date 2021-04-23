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
}

module.exports = new adminController()