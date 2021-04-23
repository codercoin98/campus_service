const mysql2 = require('mysql2');

const config = require('./config');
//创建连接池
const connections = mysql2.createPool({
    host:config.MYSQL_HOST,
    port:config.MYSQL_PORT,
    database:config.MYSQL_DATABASE,
    user:config.MYSQL_USER,
    password:config.MYSQL_PASSWORD,
    connectionLimit:20
})

connections.getConnection((err,conn) => {
    conn.connect((err) => {
        if(err){
            console.log(err)
        }
        console.log('connect database success')
    }
    )
})

module.exports = connections.promise();