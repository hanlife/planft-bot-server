const router = require('koa-router')()
const Users = require('../models/users');
const Messages = require('../models/message');
// const slimbot = require('../slimbot')

const telegraf = require('../telegraf')
const telegram = telegraf.telegram

router.prefix('/users')

router.post('/webHook', async function (ctx) {
  try {
    // console.log('[ webHook ] >', ctx.request.body.message)
    await telegraf.handleUpdate(ctx.request.body)
  } catch (error) {
    console.log('[ webHook error ] >', error)
  }
  ctx.body = {
    code: 0,
    data: null,
    message: 'success',
  }
})

router.post('/verify', async function (ctx, next) {
  let data = ctx.request.body
  const { userId, groupId, contract, tokenId } = data
  
  // 删除已验证用户
  for(let i=0; i<global.checkUser.length; i++){
    const { chatId, newChatMemberId } = global.checkUser[i]
    if(chatId == groupId && newChatMemberId == userId) {
      console.log('[ 验证踢人通过 ] >')
      global.checkUser.splice(i, 1)
    }
  }

  try {
    const find_res = await Users.find().where({
      groupId, tokenId
    });
    if (find_res.length === 0) {
      await Users.create({
        userId, groupId, contract, tokenId
      })
      const message = await Messages.find().where({
        chatId: groupId,
        newChatMemberId: userId
      }).sort({ createTime: -1 }).limit(1)
      // 删除验证消息
      if (message[0].messageId) {
        await telegram.deleteMessage(groupId, Number(message[0].messageId))
        await Messages.deleteOne({
          messageId: message[0].messageId
        })
      }
      telegram.restrictChatMember(groupId, userId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: true,
        can_invite_users: true,
        can_pin_messages: true
      })

      ctx.body = {
        code: 0,
        data: null,
        message: 'verify success',
      }
    } else {
      const message = await Messages.find().where({
        chatId: groupId,
        newChatMemberId: userId
      }).sort({ createTime: -1 }).limit(1)
      // 删除验证消息
      if (message[0].messageId) {
        await telegram.deleteMessage(groupId, Number(message[0].messageId))
        await Messages.deleteOne({
          messageId: message[0].messageId
        })
      }
      // 用户不一致
      if (find_res[0].userId != userId) {
        const id = find_res[0]._id
        await Users.findByIdAndUpdate({ _id: id }, {
          userId
        })
        // 踢掉之前用户
        await telegram.kickChatMember(groupId, find_res[0].userId, {
          until_date: 0
        });
        await telegram.unbanChatMember(groupId, find_res[0].userId)
      }

      // 解禁当前用户
      telegram.restrictChatMember(groupId, userId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: true,
        can_invite_users: true,
        can_pin_messages: true
      })
      ctx.body = {
        code: 0,
        data: null,
        message: 'update success',
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

// 验证未通过
router.post('/verifyFail', async function (ctx, next) {
  try {
    let data = ctx.request.body
    const { userId, groupId } = data
    // 删除已验证用户
    for(let i=0; i<global.checkUser.length; i++){
      const { chatId, newChatMemberId } = global.checkUser[i]
      if(chatId == groupId && newChatMemberId == userId) {
        console.log('[ 验证未通过踢人通过 ] >')
        global.checkUser.splice(i, 1)
      }
    }

    const message = await Messages.find().where({
      chatId: groupId,
      newChatMemberId: userId
    }).sort({ createTime: -1 }).limit(1)
    // 删除验证消息
    if (message[0].messageId) {
      // 踢掉之前用户
      telegram.kickChatMember(groupId, userId, {
        until_date: 0
      });
      await telegram.unbanChatMember(groupId, userId)
      await telegram.deleteMessage(groupId, Number(message[0].messageId))
      await Messages.deleteOne({
        messageId: message[0].messageId
      })
    }
    ctx.body = {
      code: 0,
      data: null,
      message: 'success',
    }
  } catch (error) {
    console.log(error)
    ctx.body = {
      code: -1,
      data: error,
      message: 'error',
    }
  }

})

module.exports = router
