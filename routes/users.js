const router = require('koa-router')()
const Users = require('../models/users');
const Messages = require('../models/message');
// const slimbot = require('../slimbot')

const telegraf = require('../telegraf')
const telegram = telegraf.telegram

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
      }).sort({createTime: -1}).limit(1)
      console.log('[ message ] >', message.messageId)
      // 删除验证消息
      if(message.messageId){
        await telegram.deleteMessage(groupId, Number(message.messageId))
        await Messages.deleteOne({
          messageId: message.messageId
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
      const id = find_res[0]._id
      await Users.findByIdAndUpdate({ _id: id }, {
        userId
      })
      
      const message = await Messages.find().where({
        chatId: groupId,
        newChatMemberId: userId
      }).sort({createTime: -1}).limit(1)
      // 删除验证消息
      if(message.messageId){
        await telegram.deleteMessage(groupId, Number(message.messageId))
        await Messages.deleteOne({
          messageId: message.messageId
        })
      }
      // 用户不一致
      if(find_res[0].userId != userId){
        await Users.deleteOne({_id: id})
        // 踢掉之前用户
        telegram.kickChatMember(groupId, find_res[0].userId, {
          until_date: 0
        });
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
router.post('/verifyFail', async function(ctx) {
  let data = ctx.request.body
  const { userId, groupId } = data
  const message = await Messages.find().where({
    chatId: groupId,
    newChatMemberId: userId
  }).sort({createTime: -1}).limit(1)
  // 删除验证消息
  if(message.messageId){
    await telegram.deleteMessage(groupId, Number(message.messageId))
    await Messages.deleteOne({
      messageId: message.messageId
    })
    // 踢掉之前用户
    telegram.kickChatMember(groupId, userId, {
      until_date: 0
    });
  }

})

module.exports = router
