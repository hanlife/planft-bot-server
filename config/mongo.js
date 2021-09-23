const mongoose = require('mongoose').set('debug', true);

const url = 'mongodb://planft:planft123456@localhost:27017/planft-bot-serve'

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