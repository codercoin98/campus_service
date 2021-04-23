const fileService = require('../service/file.service')
const userService = require('../service/user.service')
const { APP_HOST, APP_PORT } = require('../app/config')
class FileController {
    //保存头像信息
    async saveAvatarInfo (ctx, next) {
        console.log(ctx.req.file)
        //1.获取头像信息
        const { mimetype, filename, size } = ctx.req.file
        const { uid } = ctx.user
        //2.判断该用户是否已经有头像记录
        const judge = await fileService.getAvatarByUserId(uid)

        if (judge.length === 1) {
            //用户已用头像记录，更新图像信息
            const updateAvatarResult = await fileService.updateAvatar(filename, mimetype, size, uid)

        } else {
            //将头像信息数据保存在数据库
            const saveAvatarResult = await fileService.createAvatar(filename, mimetype, size, uid)
        }



        // console.log(saveAvatarResult)

        //3.将图片地址保存到user表中
        const avatarUrl = `${APP_HOST}:${APP_PORT}/user/${uid}/avatar`
        await userService.updateUserAvatarUrl(avatarUrl, uid)
        // console.log(updateUserAvatarResult)

        //4.返回结果
        ctx.body = {
            status: 200,
            message: 'UPLOAD_SUCCESS'
        }
    }

}

module.exports = new FileController()