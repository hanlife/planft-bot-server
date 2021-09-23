const router = require('koa-router')()
const mysql = require('../config/mysql');

router.prefix('/users')

router.post('/verify', async function (ctx, next) {
  let data = ctx.request.body
  const { userId, groupId, contract, tokenId } = data
  try {
    const find_res = await Users.find().where({
      groupId, tokenId
    });
    console.log("find_res.length", find_res.length)
    if (find_res.length === 0) {
      await Users.create({
        userId, groupId, contract, tokenId
      })
      const message = await Messages.find().where({
        chatId: groupId,
        newChatMemberId: userId
      }).sort({ createTime: -1 }).limit(1)
      console.log('[ message ] >', message.messageId)
      // 删除验证消息
      if (message.messageId) {
        await slimbot.deleteMessage(groupId, Number(message.messageId))
        await Messages.deleteOne({
          messageId: message.messageId
        })
      }
      slimbot.restrictChatMember(groupId, userId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: true,
        can_invite_users: true,
        can_pin_messages: true
      }, {
        until_date: (new Date().getTime()) / 1000,
      })

      ctx.body = {
        code: 0,
        data: null,
        message: '验证成功',
      }
    } else {
      const id = find_res[0]._id
      await Users.findByIdAndUpdate({ _id: id }, {
        userId
      })
      const message = await Messages.findOne().where({
        chatId: groupId,
        newChatMemberId: userId
      })
      // 删除验证消息
      if (message.messageId) {
        await slimbot.deleteMessage(groupId, Number(message.messageId))
        await Messages.deleteOne({
          messageId: message.messageId
        })
      }

      // 踢掉之前用户
      slimbot.kickChatMember(groupId, find_res[0].userId, {
        until_date: 0,
      })

      // 解禁当前用户
      slimbot.restrictChatMember(groupId, userId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: true,
        can_invite_users: true,
        can_pin_messages: true
      }, {
        until_date: (new Date().getTime()) / 1000,
      })
      ctx.body = {
        code: 0,
        data: null,
        message: '更新成功',
      }
    }
  } catch (error) {
    ctx.body = {
      code: -1,
      data: error,
      message: 'error',
    }
  }
})

router.post('/addUser', async function (ctx) {
  let data = ctx.request.body
  const { userId, groupId, contract, tokenId } = data
  console.log(data)
  try {
    const arr = [
      userId, groupId, contract, tokenId
    ]
    const res = await mysql.createUserData(arr)
    console.log('[ res ] >', res)
    ctx.body = {
      code: 0,
      data: res,
      message: null,
    }
  } catch (error) {
    console.log('[ error ] >', error)
    ctx.body = {
      code: -1,
      data: null,
      message: error,
    }
  }
})

router.post('/getUser', async function (ctx) {
  let data = ctx.request.body
  const { groupId, tokenId } = data
  try {
    const res = await mysql.findUserData(groupId, tokenId)
    console.log('[ res ] >', res)
    ctx.body = {
      code: 0,
      data: res,
      message: null,
    }
  } catch (error) {
    console.log('[ error ] >', error)
    ctx.body = {
      code: -1,
      data: null,
      message: error,
    }
  }
})

router.post('/getMessage', async function (ctx) {
  let data = ctx.request.body
  const { chatId, newChatMemberId } = data
  try {
    const res = await mysql.findMessageData(chatId, newChatMemberId)
    console.log('[ res ] >', res)
    ctx.body = {
      code: 0,
      data: res,
      message: null,
    }
  } catch (error) {
    console.log('[ error ] >', error)
    ctx.body = {
      code: -1,
      data: null,
      message: error,
    }
  }
})

router.post('/createMessage', async function (ctx) {
  let data = ctx.request.body
  const { chatId, newChatMemberId, messageId } = data
  const createTime = new Date().toJSON().slice(0, 19).replace('T', ' ')
  try {
    const arr = [chatId, newChatMemberId, messageId, createTime]
    const res = await mysql.createMessageData(arr)
    console.log('[ res ] >', res)
    ctx.body = {
      code: 0,
      data: res,
      message: null,
    }
  } catch (error) {
    console.log('[ error ] >', error)
    ctx.body = {
      code: -1,
      data: null,
      message: error,
    }
  }
})

router.post('/deleteMessageData', async function (ctx) {
  let data = ctx.request.body
  const { messageId } = data
  try {
    const res = await mysql.deleteMessageData(messageId)
    console.log('[ res ] >', res)
    ctx.body = {
      code: 0,
      data: res,
      message: null,
    }
  } catch (error) {
    console.log('[ error ] >', error)
    ctx.body = {
      code: -1,
      data: null,
      message: error,
    }
  }
})

router.post('/updateUserData', async function (ctx) {
  let data = ctx.request.body
  const { userId, id } = data
  try {
    const arr = [userId, id]
    const res = await mysql.updateUserData(arr)
    console.log('[ res ] >', res)
    ctx.body = {
      code: 0,
      data: res,
      message: null,
    }
  } catch (error) {
    console.log('[ error ] >', error)
    ctx.body = {
      code: -1,
      data: null,
      message: error,
    }
  }
})

module.exports = router
