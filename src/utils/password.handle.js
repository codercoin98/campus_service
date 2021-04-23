/* 密码加密工具 */
const ctypto = require('crypto')

const md5password = (password) => {
    const md5 = ctypto.createHash('md5');
    //将密码加密为16进制
    const result = md5.update(password).digest('hex');

    return result;
}

module.exports = {md5password};