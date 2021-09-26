const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema

// Schema
const messageSchema = new Schema({
    // _id: { type: ObjectId }, // 默认生成，不加也可以
    chatId: { type: String, required: [true,'chatId cannot be empty'] },
    newChatMemberId: { type: String, required: [true,'newChatMemberId cannot be empty'] },
    messageId: { type: String, required: [true,'messageId cannot be empty'] },
    createTime:  { type: Date, required: [true,'createTime cannot be empty'] },
})

// Model
const messages = mongoose.model('message',messageSchema);

module.exports = messages;