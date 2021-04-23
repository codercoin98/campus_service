const Router = require('koa-router')

const { verifyAuth } = require('../middleware/auth.middleware')
const { avatarHandler } = require('../middleware/file.middleware')
const { saveAvatarInfo, getTaskFiles } = require('../controller/file.controller')
const fileRouter = new Router({ prefix: '/upload' })

//用户头像上传
fileRouter.post('/avatar', verifyAuth, avatarHandler, saveAvatarInfo)

module.exports = fileRouter