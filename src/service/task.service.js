const connection = require('../app/database')
class taskService {
    //保存用户发布的任务信息
    async saveTask (task) {
        if (task.type === '代取快递') {
            //代取快递任务
            const statement = 'INSERT INTO `task` (`task_number`,`type`,`title`,`description`,`upload_file_url`,`commission`,`expiration_time`,`addressee`,`telephone`,`address`,`owner_id`) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
            const [result] = await connection.execute(statement, [task.task_number, task.type, task.title, task.description, task.upload_file_url, task.commission, task.expiration_time, task.addressee, task.telephone, task.address, task.uid])
            return result
        } else {
            //代打印，代购物
            const statement = 'INSERT INTO `task` (`task_number`,`type`,`title`,`description`,`upload_file_url`,`copies`,`estimated_amount`,`commission`,`expiration_time`,`addressee`,`telephone`,`address`,`owner_id`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
            const [result] = await connection.execute(statement, [task.task_number, task.type, task.title, task.description, task.upload_file_url, task.copies, task.estimated_amount, task.commission, task.expiration_time, task.addressee, task.telephone, task.address, task.uid])

            return result
        }
    }
    //保存任务文件信息
    async createTaskFile (filename, mimetype, task_number, uid) {
        const statement = 'INSERT INTO `task_file` (`filename`,`mimetype`,`task_number`,`release_user_id`) VALUES(?,?,?,?)'
        const [result] = await connection.execute(statement, [filename, mimetype, task_number, uid])
        return result
    }
    //获取用户已发布的任务
    async getUserReleaseTaskList (type, status, uid) {
        let task_type = ''
        let task_status = null
        //根据任务类型和任务状态进行查询
        switch (type) {
            case 0:
                task_type = '代取快递'
                break
            case 1:
                task_type = '代打印'
                break
            case 2:
                task_type = '代购物'
                break
            case 3:
                task_type = '其他代跑'
                break
            default:
                break
        }
        switch (status) {
            case 0:
                task_status = 1
                break
            case 1:
                task_status = 2
                break
            case 2:
                task_status = 3
                break
            case 3:
                task_status = 4
                break
            case 4:
                task_status = 5
                break
            default:
                break
        }
        const statement = 'SELECT * FROM `task` WHERE `type` =? AND `status` = ? AND `owner_id` = ?'
        const [result] = await connection.execute(statement, [task_type, task_status, uid])
        return result
    }
    async getUserReceiveTaskList (type, status, uid) {
        let task_type = ''
        let task_status = null
        //根据任务类型和任务状态进行查询
        switch (type) {
            case 0:
                task_type = '代取快递'
                break
            case 1:
                task_type = '代打印'
                break
            case 2:
                task_type = '代购物'
                break
            case 3:
                task_type = '其他代跑'
                break
            default:
                break
        }
        switch (status) {
            case 0:
                task_status = 2
                break
            case 1:
                task_status = 3
                break
            case 2:
                task_status = 5
                break
            default:
                break
        }
        const statement = 'SELECT * FROM `task` JOIN `user_receive_task` ON `task`.tid = `user_receive_task`.tid WHERE `task`.type = ? AND `task`.status = ? AND `user_receive_task`.receiver_id = ?'
        const [result] = await connection.execute(statement, [task_type, task_status, uid])
        return result
    }
    //获取任务信息
    async getTaskDetails (tid) {
        const statement = 'SELECT * FROM `task` WHERE `tid` = ?'
        const [result] = await connection.execute(statement, [tid])
        return result[0]
    }
    //获取任务进程信息
    async getReceiveTaskProcess (tid) {
        const statement = 'SELECT * FROM `task_receive_process` WHERE `tid` = ?'
        const [result] = await connection.execute(statement, [tid])
        return result[0]
    }
    //获取任务编号
    async getTaskNumber (tid) {
        const statement = 'SELECT `task_number` FROM `task` WHERE `tid` = ?'
        const [result] = await connection.execute(statement, [tid])
        return result[0]
    }
    //获取任务文件的类型
    async getTaskFileType (filename) {
        const statement = 'SELECT `mimetype` FROM `task_file` WHERE `filename` = ?'
        const [result] = await connection.execute(statement, [filename])
        return result[0]
    }
    //检查所有闲置任务的过期时间并更新状态
    async checkExpirationTime () {
        const statement = 'UPDATE `task` SET `status` = 4 WHERE `status` = 1 AND `expiration_time` <= now()'
        await connection.execute(statement)
    }
    //更新任务状态
    async updateTaskStatus (tid, status) {
        try {
            const statement = 'UPDATE `task` SET `status` = ? WHERE `tid` = ?'
            const [result] = await connection.execute(statement, [status, tid])
            return result
        } catch (error) {
            console.log(error)
        }
    }
    //获取最新任务
    async getLatestTask (type, sortord, uid, university_name) {
        const statement = "SELECT * FROM `task` JOIN `user_student_info` ON `task`.`owner_id` = `user_student_info`.`user_id` WHERE `user_student_info`.`university_name` = ? AND `task`.`type` = ? AND `task`.`status` = 1 AND `task`.`owner_id` NOT IN (?) ORDER BY  CONCAT('`task`','.',?) DESC"
        const [result] = await connection.execute(statement, [university_name, type, uid, sortord])
        //获取记录总数
        const statement2 = "SELECT COUNT(*) AS num FROM `task` JOIN `user_student_info` ON `task`.`owner_id` = `user_student_info`.`user_id` WHERE `user_student_info`.`university_name` = ? AND `task`.`type` = ? AND `task`.`status` = 1 AND `task`.`owner_id` NOT IN (?) ORDER BY  CONCAT('`task`','.',?) DESC"
        const [result2] = await connection.execute(statement2, [university_name, type, uid, sortord])
        let res = Array()
        res[0] = result
        res[1] = result2
        return res

    }
    //用户接取任务,生成记录
    async createReceiveRecord (tid, receiver_id) {
        const statement = "INSERT INTO `user_receive_task` (`tid`,`receiver_id`) VALUES (?,?)"
        const [result] = await connection.execute(statement, [tid, receiver_id])
        return result
    }
    //生成代跑进程表
    async createReceiveProcess (tid, owner_id, receiver_id) {
        const statement = "INSERT INTO `task_receive_process` (`tid`,`releaser_id`,`receiver_id`) VALUES (?,?,?)"
        const [result] = await connection.execute(statement, [tid, owner_id, receiver_id])
        return result
    }
    //通过进程id获取任务id,发布用户id，代跑用户id
    async getTaskIds (process_id) {
        const statement = "SELECT `tid`,`releaser_id`,`receiver_id` FROM `task_receive_process` WHERE `id` = ?"
        const [result] = await connection.execute(statement, [process_id])
        return result[0]
    }
    //更改任务进程状态
    async changeProcess (status, process_id) {
        let statement = ''
        switch (status) {
            case 'obtain_delivery':
                statement = "UPDATE `task_receive_process` SET `obtain_delivery` = 1 , `obtain_delivery_at` = NOW() WHERE `id` = ?"
                break
            case 'printed':
                statement = "UPDATE `task_receive_process` SET `printed` = 1 , `printed_at` = NOW() WHERE `id` = ?"
                break
            case 'bought':
                statement = "UPDATE `task_receive_process` SET `bought` = 1 , `bought_at` = NOW() WHERE `id` = ?"
                break
            case 'is_sending':
                statement = "UPDATE `task_receive_process` SET `is_sending` = 1 , `is_sending_at` = NOW() WHERE `id` = ?"
                break
            case 'arrived':
                statement = "UPDATE `task_receive_process` SET `arrived` = 1 , `arrived_at` = NOW() WHERE `id` = ?"
                break
            case 'receiver_confirm':
                statement = "UPDATE `task_receive_process` SET `receiver_confirm` = 1 , `receiver_confirm_at` = NOW() WHERE `id` = ?"
                break
            case 'releaser_confirm':
                statement = "UPDATE `task_receive_process` SET `releaser_confirm` = 1 , `releaser_confirm_at` = NOW() WHERE `id` = ?"
                break
            default:
                break
        }
        const [result] = await connection.execute(statement, [process_id])
        return result

    }
    //根据任务编号和发布用户id获取预付款
    async getAdvance (task_number, releaser_id) {
        const statement = 'SELECT `advance` FROM `user_advance` WHERE `task_number` = ? AND `user_id` = ?'
        const [result] = await connection.execute(statement, [task_number, releaser_id])
        return result[0]
    }
    //用户评价
    async saveCommnet (receiver_id, releaser_id, task_number, rate, content) {
        const statement = "INSERT INTO `task_comment` (`task_number`,`rate`,`content`,`receiver_id`,`releaser_id`) VALUES (?,?,?,?,?)"
        const [result] = await connection.execute(statement, [task_number, rate, content, receiver_id, releaser_id])
        return result
    }
    //获取评价
    async getComment (task_number, releaser_id) {
        const statement = 'SELECT * FROM `task_comment` WHERE `task_number` = ? AND `releaser_id` = ?'
        const [result] = await connection.execute(statement, [task_number, releaser_id])
        return result[0]
    }
    //用户提交投诉
    async saveComplaint (task_number, receiver_id, content, user_id) {
        const statement = "INSERT INTO `user_complaint` (`task_number`,`content`,`receiver_id`,`user_id`) VALUES (?,?,?,?)"
        const [result] = await connection.execute(statement, [task_number, content, receiver_id, user_id])
        return result
    }
    //获取是否有评价记录
    async getCommentStatus(task_number, uid) {
        const statement = 'SELECT COUNT(*) as num FROM `task_comment` WHERE `task_number` = ? AND `releaser_id` = ? LIMIT 1'
        const [result] = await connection.execute(statement, [task_number, uid])
        return result[0]
    }
    //获取是否有投诉记录
    async getComplaint (task_number, uid) {
        const statement = 'SELECT COUNT(*) as num FROM `user_complaint` WHERE `task_number` = ? AND `user_id` = ? LIMIT 1'
        const [result] = await connection.execute(statement, [task_number, uid])
        return result[0]
    }
}

module.exports = new taskService()