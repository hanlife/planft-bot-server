const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.bot_token);
const Messages = require('./models/message');
const schedule = require('node-schedule');

const dealTime = 6
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

    const username = `${new_chat_member.first_name} ${new_chat_member.last_name}`
    const res = await ctx.replyWithHTML(
      `<a href="${process.env.auth_host}/#/verify?groupId=${chat.id}&userId=${new_chat_member.id
      }">Welcome ${username}, Please click NFT Authentication</a>`
    );

    const message_id = res.message_id;
    // 机器人消息存入数据库
    await Messages.create({
      chatId: chat.id,
      newChatMemberId: new_chat_member.id,
      messageId: message_id,
      createTime: new Date()
    })

    // setTimeout(() => {
    //   checkResult(message_id)
    // }, 6 * 60 * 1000)
    global.checkUser.push({
      createTime: new Date().getTime(),
      chatId: chat.id,
      newChatMemberId: new_chat_member.id,
      messageId: message_id,
    })
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

// 一分钟检测一次
let rule = new schedule.RecurrenceRule();
// rule.second = 0; // 每分钟 0 秒执行
rule.second = [0, 10, 20, 30, 40, 50]; // 每隔 10 秒执行一次
schedule.scheduleJob(rule, async () => {
  const arr = JSON.parse(JSON.stringify(global.checkUser))
  for (let i = 0; i < arr.length; i++) {
    const now = new Date().getTime()
    console.log('[ 时间检测 ] >', now - arr[i].createTime)
    if (now - arr[i].createTime > (dealTime * 60 * 1000)) {
      await checkResult2(arr[i], i)
    }
  }
});

bot.on('chat_member', async ctx => {
  console.log('[ chat_member ] >', ctx)
})
bot.on('new_chat_members', async ctx => {
  console.log('[ new_chat_members ] >', ctx)
})
bot.on('left_chat_member', async ctx => {
  console.log('[ left_chat_member ] >', ctx)
})

async function checkResult2 (data, i) {
  try {
    console.log('[ checkResult2 ] >', data, i)
    await bot.telegram.deleteMessage(data.chatId, data.messageId)
    await bot.telegram.kickChatMember(data.chatId, data.newChatMemberId, {
      until_date: 0
    });
    await bot.telegram.unbanChatMember(data.chatId, data.newChatMemberId)
  } catch (error) {
    console.log('[ error ] >', error)
  }
  global.checkUser.splice(i, 1)
}

async function checkResult (message_id) {
  try {
    const message = await Messages.find().where({
      messageId: message_id,
    }).sort({ createTime: -1 }).limit(1)
    if (message.length > 0) {
      // 踢掉该用户
      console.log('[ ti chu message ] >', message)
      // bot.telegram.deleteMessage(message[0].chatId, message_id)
      bot.telegram.kickChatMember(message[0].chatId, message[0].newChatMemberId, {
        until_date: 0
      });
    }
  } catch (error) {
    console.log('[ error ] >', error)
  }
}

// bot.launch().then(() => {
//   console.info(`Bot ${bot.botInfo.username} is up and running`);
// });
// console.log('[ setWebhook ] >', `${process.env.auth_host}api/users/webHook`)
// bot.telegram.setWebhook(`${process.env.auth_host}api/users/webHook`)

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot
