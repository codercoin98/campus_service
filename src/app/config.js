/* 使用dotenv将 所有.env文件中 的变量加入到环境变量中 */
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')
const envPath = path.resolve(__dirname, '../../.env')
const privateKeyPath = path.resolve(__dirname, './keys/private.key')
const publicKeyPath = path.resolve(__dirname, './keys/public.key')
dotenv.config({
    path: envPath
})

const PRIVATE_KEY = fs.readFileSync(privateKeyPath)
const PUBLIC_KEY = fs.readFileSync(publicKeyPath)
//导出环境变量
module.exports = {
    APP_HOST,
    APP_PORT,
    SOCKET_PORT,
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE,
    MYSQL_USER,
    MYSQL_PASSWORD
} = process.env

module.exports.PRIVATE_KEY = PRIVATE_KEY
module.exports.PUBLIC_KEY = PUBLIC_KEY