const { Telegraf } = require('telegraf');
const bot = new Telegraf('2008780620:AAHaqLdchsjovVdwr4MxQyl-J07NmmVRFfg');
const Messages = require('./models/message');

bot.on('message', async ctx => {
  console.log('message', ctx.message);
  const new_chat_member = ctx.message.new_chat_member;
  if (new_chat_member && !new_chat_member.is_bot) {
    const chat = ctx.message.chat;
    const new_chat_member = ctx.message.new_chat_member;
    const tomorrow = (new Date().getTime() + 1 * 60 * 60 * 1000) / 1000;
    ctx.telegram.restrictChatMember(chat.id, new_chat_member.id, {
      until_date: tomorrow,
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_polls: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
      can_change_info: false,
      can_invite_users: false,
      can_pin_messages: false
    });

    const res = await ctx.replyWithHTML(
      `<a href="http://test.planft.com/#/verify?groupId=${chat.id}&userId=${new_chat_member.id
      }">NFT Authentication</a>`
    );

    const message_id = res.message_id;
    // 机器人消息存入数据库
    await Messages.create({
      chatId: chat.id,
      newChatMemberId: new_chat_member.id,
      messageId: message_id,
      createTime: new Date().getTime()
    })

    setTimeout(() => {
      checkResult(message_id)
    }, 6 * 60 * 1000)
    // setTimeout(() => {
    //   const checkResult = true;
    //   if (checkResult) {
    //     ctx.telegram.deleteMessage(chat.id, message_id); // 删除验证记录
    //     ctx.telegram.restrictChatMember(chat.id, new_chat_member.id, {
    //       can_send_messages: true,
    //       can_send_media_messages: true,
    //       can_send_polls: true,
    //       can_send_other_messages: true,
    //       can_add_web_page_previews: true,
    //       can_change_info: true,
    //       can_invite_users: true,
    //       can_pin_messages: true
    //     });
    //   } else {
    //     ctx.telegram.kickChatMember(chat.id, new_chat_member.id, {
    //       until_date: 0
    //     });
    //   }
    // }, 30 * 1000);
  }
});

async function checkResult (message_id) {
  const message = await Messages.find().where({
    messageId: message_id,
  }).sort({createTime: -1}).limit(1)
  if (message) {
    // 踢掉该用户
    console.log('[ ti chu message ] >', message)
    bot.telegram.kickChatMember(message.chatId, message.newChatMemberId, {
      until_date: 0
    });
  }
}

bot.launch().then(() => {
  console.info(`Bot ${bot.botInfo.username} is up and running`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot