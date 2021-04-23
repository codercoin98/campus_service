const Multer = require('koa-multer')
const { AVATAR_PATH } = require('../constants/filePath')

//定义头像文件上传
const avatarUpload = Multer({
    dest: AVATAR_PATH
})

const avatarHandler = avatarUpload.single('avatar')
module.exports = {
    avatarHandler
}