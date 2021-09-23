const mongoose = require('mongoose').set('debug', true);

console.log(process.env.mongo)
const url = process.env.mongo

module.exports = {
    connect: ()=> {            
        mongoose.connect(url)
        let db = mongoose.connection
        db.on('error', console.error.bind(console, '连接错误:'));
        db.once('open', ()=> {
            console.log('mongodb connect suucess');
        })
    }
}