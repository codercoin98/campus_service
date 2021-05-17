const { SOCKET_PORT } = require('./config')
const io = require('socket.io')
const chatService = require('../service/chat.service')
//保存每个连接成功用户的socket id
let socket_map = new Map()
//配置用户通信
io(SOCKET_PORT, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ['GET', 'POST']
    }
}).on('connection', (socket) => {
    console.log('socket connect success,listen:' + SOCKET_PORT)
    //监听用户加入
    socket.on('join', (uid) => {
        socket_map.set(uid, socket.id)
    })
    //监听用户发送消息,并发送给对应的客户端
    socket.on('send', async (data) => {
        console.log(socket_map)
        //获取发送用户和目标用户的socket id
        const to_socket_id = socket_map.get(data.to_id)
        const from_socket_id = socket_map.get(data.from_id)
        console.log(to_socket_id)
        //保存到数据库
        const result = await chatService.saveSenderMessage(data)
        //获取刚保存消息的id
        const { id } = await chatService.getLastMessageId(data)
        data.message_id = id
        //保存成功，转发消息
        if (result.affectedRows === 1) {
            //对方处于房间，立即转发消息
            if (to_socket_id) {
                socket.to(to_socket_id).emit('getMessage', data)
            }

        } else {
            //保存失败，返回错误信息
            socket.to(from_socket_id).emit('Error', new Error('SEND_FAIL'))
        }
    })
    //监听用户断开连接
    socket.on('out', (uid) => {
        console.log('user disconnet')
    })
    //监听用户离开房间
    socket.on('leave', (uid) => {
        console.log('离开前：', socket_map)
        //清楚保存的scoket id
        socket_map.delete(uid)
        console.log('离开后', socket_map)
    })
})
