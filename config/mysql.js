var mysql = require('mysql');

const config = {
  // 数据库配置
  database: {
    DATABASE: 'xxx', //数据库名称
    USERNAME: 'xxx', //mysql用户名
    PASSWORD: 'xxx', //mysql密码
    PORT: '3306', //mysql端口号
    HOST: 'xx.xxx.xx.xx' //服务器ip
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
  findUserData: function (name) {
    let _sql = `select * from users where name="${name}";`
    return allServices.query(_sql)
  },
  addUserData: (obj) => {
    let _sql = "insert into users set name=?,pass=?,avator=?,moment=?;"
    return allServices.query(_sql, obj)
  },
}

module.exports = allServices;