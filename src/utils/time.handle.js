/* 时间处理工具 */
const moment = require('moment')

const TimeHandler = (time) => {
    //将字符串传化为date类型,yy-mm-dd,字符串必须符合RFC2822 or ISO标准
    const newTime = moment(new Date(time)).format('YYYY-MM-DD')
    return newTime
}
//将后台获取到的UTC时间转换为本地时间
const changeUTC = (time) => {
    if(!time) {
        return
    }
    const newTime = moment(new Date(time)).format('YYYY-MM-DD HH:mm:ss')
    return newTime
}

module.exports = { TimeHandler, changeUTC }