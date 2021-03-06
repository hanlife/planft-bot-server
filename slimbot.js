const Slimbot = require('slimbot');
const bot = new Slimbot('2008780620:AAHaqLdchsjovVdwr4MxQyl-J07NmmVRFfg');
const Messages = require('./models/message');

// Register listeners
bot.on('message', async ctx => {
  const new_chat_member = ctx.new_chat_member
  if (new_chat_member && !new_chat_member.is_bot) {
    const chat = ctx.chat;
    const tomorrow = (new Date().getTime() + 1 * 5 * 60 * 1000) / 1000;
    bot.restrictChatMember(chat.id, new_chat_member.id, {
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_polls: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
      can_change_info: false,
      can_invite_users: false,
      can_pin_messages: false
    }, {
      until_date: tomorrow,
    })

    const res_message = await bot.sendMessage(chat.id, `<a href="http://test.planft.com/#/verify?groupId=${chat.id}&userId=${new_chat_member.id
      }">NFT Authentication</a>`, {
      parse_mode: 'HTML',
    })
    const message_id = res_message.result.message_id;
    // 机器人消息存入数据库
    await Messages.create({
      chatId: chat.id,
      newChatMemberId: new_chat_member.id,
      messageId: message_id,
      createTime: new Date().getTime()
    })

    setTimeout(()=>{
      checkResult(message_id, chat.id)
    }, 30 * 1000)
  }
});

async function checkResult(message_id, chatId) {
  const message = await Messages.find().where({
    chatId: chatId,
    messageId: message_id,
  }).sort({createTime: -1}).limit(1)
  if(message) {
    // 踢掉该用户
    console.log('[ ti chu message ] >', message)
    bot.kickChatMember(message.chatId, message.newChatMemberId, {
      until_date: 0,
    })
  }
}

// Call API

bot.startPolling();


module.exports = bot