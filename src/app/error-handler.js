const errorTypes = require('../constants/error-types')
//处理错误
const errorHandler = (error, ctx) => {

    let status, message

    switch (error.message) {
        case errorTypes.NAME_OR_PASSWORD_IS_REQUIRED:
            status = 400//Bad Request
            message = errorTypes.NAME_OR_PASSWORD_IS_REQUIRED
            break
        case errorTypes.USER_ALREADY_EXISTS:
            status = 409//conflict
            message = errorTypes.USER_ALREADY_EXISTS
            break
        case errorTypes.USER_DOES_NOT_EXISTS:
            status = 400//Bad Request
            message = errorTypes.USER_DOES_NOT_EXISTS
            break
        case errorTypes.PASSWORD_IS_INCORENT:
            status = 401
            message = errorTypes.PASSWORD_IS_INCORENT
            break
        case errorTypes.UNAUTHORIZATION:
            status = 401
            message = errorTypes.UNAUTHORIZATION
            break
        case errorTypes.EXPIRATION_TOKEN:
            status = 401
            message = errorTypes.EXPIRATION_TOKEN
            break
        default:
            status = 404
            message = 'NOT FOUND'
    }

    ctx.status = status
    ctx.body = message
}

module.exports = errorHandler