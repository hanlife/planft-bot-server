const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema

// Schema
const usersSchema = new Schema({
    // _id: { type: ObjectId }, // 默认生成，不加也可以
    userId: { type: String, required: [true,'userId cannot be empty'] },
    groupId: { type: String, required: [true,'groupId cannot be empty'] },
    contract: { type: String, required: [true,'contract cannot be empty'] },
    tokenId: { type: Number, default: '' }
})

// Model
const users = mongoose.model('users',usersSchema);

module.exports = users;