const router = require('koa-router')()
const Users = require('../models/users');
const Messages = require('../models/message');
const slimbot = require('../slimbot')

router.prefix('/users')

router.post('/verify', async function (ctx, next) {
  let data = ctx.request.body
  const { userId, groupId, contract, tokenId } = data
  console.log("data", data)
  if(tokenId === '') {
    slimbot.kickChatMember(groupId, userId, {
      until_date: 0,
    })
  }
  try {
    const find_res = await Users.find().where({
      groupId, tokenId
    });
    console.log("find_res.length", find_res.length)
    if (find_res.length === 0) {
      await Users.create({
        userId, groupId, contract, tokenId
      })
      const message = await Messages.findOne().where({
        chatId: groupId,
        newChatMemberId: userId
      }).sort({createTime: -1})
      console.log('[ message ] >', message.messageId)
      // 删除验证消息
      if(message.messageId){
        slimbot.deleteMessage(groupId, Number(message.messageId))
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
      console.log('[ message.messageId ] >', message.messageId)
      // 删除验证消息
      if(message.messageId){
        slimbot.deleteMessage(groupId, Number(message.messageId))
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

module.exports = router
