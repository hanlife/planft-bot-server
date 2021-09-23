var mysql = require('mysql');

const config = {
  // 数据库配置
  database: {
    DATABASE: 'planft_bot', //数据库名称
    USERNAME: 'laifu', //mysql用户名
    PASSWORD: '714613002', //mysql密码
    PORT: '3306', //mysql端口号
    HOST: '127.0.0.1' //服务器ip
  }
}

var pool = mysql.createPool({
  host: config.database.HOST,
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE
});

let allServices = {
  query: function (sql, values) {
    return new Promise((resolve, reject) => {
      pool.getConnection(function (err, connection) {
        if (err) {
          reject(err)
        } else {
          connection.query(sql, values, (err, rows) => {
            if (err) {
              reject(err)
            } else {
              resolve(rows)
            }
            connection.release()
          })
        }
      })
    })
  },
  findUserData: function (groupId, tokenId) {
    let _sql = `select * from users where groupId=${groupId} and tokenId=${tokenId};`
    return allServices.query(_sql)
  },
  findMessageData: (chatId, newChatMemberId) => {
    let _sql = `select * from messages where chatId=${chatId} and newChatMemberId=${newChatMemberId};`
    return allServices.query(_sql)
  },
  deleteMessageData: (messageId) => {
    let _sql = `DELETE FROM messages where messageId=${messageId};`
    return allServices.query(_sql)
  },
  createUserData: (obj) => {
    let _sql = `insert into users set userId=?,groupId=?,contract=?,tokenId=?;`
    return allServices.query(_sql, obj)
  },
  updateUserData: (obj) => {
    let _sql = `UPDATE users SET userId=? where id=?;`
    return allServices.query(_sql, obj)
  },
  createMessageData: (obj) => {
    let _sql = `insert into messages set chatId=?,newChatMemberId=?,messageId=?,createTime=?;`
    return allServices.query(_sql, obj)
  },
}

module.exports = allServices;