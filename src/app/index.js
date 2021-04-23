const Koa = require('koa')
const kaoBody = require('koa-body')
const cors = require('koa2-cors')
const errorHandler = require('./error-handler')
const useRouters = require('../router')
require('./socket')
const app = new Koa()


//解决跨域问题
app.use(cors({
    origin: '*',
    credentials: true //证书
}))

//注册koabody来解析请求的body
app.use(kaoBody())

app.useRouters = useRouters
//注册路由
app.useRouters()

app.on('error', errorHandler)

module.exports = app