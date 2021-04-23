//生成邮箱验证码
const randomstring = require('randomstring')
//生成自定义长度的验证码
const createCode = (number, charset) => {
    return randomstring.generate({
        length: number,
        charset: charset
    })
}
module.exports = {createCode}