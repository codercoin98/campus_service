//邮件发送服务
// 引入nodemailer
const nodemailer = require('nodemailer');
// 封装发送者信息
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com', // 调用qq服务器
  secureConnection: true, // 启动SSL
  port: 465, // 端口就是465
  auth: {
    user: '1015761882@qq.com', // 账号
    pass: '', // 授权码，自备,
  },
});

module.exports = transporter
