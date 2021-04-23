const jwt = require('jsonwebtoken')
const balanceService = require('../service/balance.service')
const transporter = require('../service/email.service')
const { createCode } = require('../utils/code.handle')
const { PRIVATE_KEY } = require('../app/config')
const userService = require('../service/user.service')
const { delay } = require('../middleware/auth.middleware')
class AuthController {
    async login (ctx, next) {
        const { uid, username } = ctx.user
        //颁发token
        const token = jwt.sign({ uid, username }, PRIVATE_KEY, {
            //token有效时间(s)
            expiresIn: 60 * 60 * 24,
            //采用的加密算法
            algorithm: 'RS256'
        })

        ctx.body = { uid, username, token }
    }

    async success (ctx, next) {
        //验证成功，返回结果
        const VerifyTokenMessage = 'VERIFY_TOKEN_SUCCESS'
        const VerifyCode = 200
        ctx.body = { VerifyTokenMessage, VerifyCode }
    }

    //校验用户支付密码
    async verifyPayPassword (ctx, next) {

        const { pay_password, uid } = ctx.request.body
        const user_id = parseInt(uid)
        //获取用户支付密码进行判断
        const result = await balanceService.getUserPayPassword(user_id)

        if (result.pay_password !== pay_password) {
            //支付密码不符合
            const VerifyMessage = 'PAY_PASSWORD_WROPNG'
            const VerifyCode = 500
            ctx.body = { VerifyMessage, VerifyCode }
        } else {
            //支付密码符合
            const VerifyMessage = 'PAY_PASSWORD_MATCHED'
            const VerifyCode = 200
            ctx.body = { VerifyMessage, VerifyCode }
        }
    }

    //用户邮箱注册，获取邮箱验证码
    async getEmailCode (ctx, next) {
        const { email } = ctx.request.body
        //生成验证码
        const code = createCode(6, 'alphanumeric')
        //将邮箱和验证码保存到数据库
        await userService.saveEmailCode(email, code)
        //配置邮箱发送信息
        // 邮件参数及内容
        const mailOptions = {
            from: '代跑官方 1015761882@qq.com', // 发送者,与上面的user一致
            // 可以指定发送者的名字，和发送邮箱用空格隔开
            //from: 'mrcdh mrcdh@qq.com',
            to: email, // 接收者,可以同时发送多个,以逗号隔开
            subject: '代跑平台注册', // 标题
            // text: '测试内容', // 文本
            html: '<h2>请在有效时间内使用</h2><br><h2>您的注册验证码为：</h2><br><h1>' + code + '</h1>',
        }

        // 调用函数，发送邮件
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err)
                return
            }
            console.log(info)
            return
        })

        const message = 'SEND_SUCCESS'
        const sendStatus = 200
        ctx.body = { message, sendStatus }
        //设置验证码失效时间
        delay(1000 * 60, email)

    }
}

module.exports = new AuthController()