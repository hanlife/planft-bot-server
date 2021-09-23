const Slimbot = require('slimbot');
const slimbot = new Slimbot('1982329197:AAFSjT950PZSp8v_mXqDeLwfz7svVb55b-g');
const Messages = require('./models/message');

// Register listeners
console.log(111)
slimbot.on('message', async ctx => {
  console.log(111)
  const new_chat_member = ctx.new_chat_member
  if (new_chat_member && !new_chat_member.is_bot) {
    const chat = ctx.chat;
    const tomorrow = (new Date().getTime() + 1 * 5 * 60 * 1000) / 1000;
    slimbot.restrictChatMember(chat.id, new_chat_member.id, {
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

    const res_message = await slimbot.sendMessage(chat.id, `<a href="http://127.0.0.1:3001?groupId=${chat.id}&userId=${new_chat_member.id
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
    // setTimeout(()=>{
    //   const checkResult = true;
    //   if(checkResult) {
    //       console.log('true')
    //       slimbot.deleteMessage(chat.id, message_id)
    //       slimbot.restrictChatMember(chat.id, new_chat_member.id, {
    //           can_send_messages: true,
    //           can_send_media_messages: true,
    //           can_send_polls: true,
    //           can_send_other_messages: true,
    //           can_add_web_page_previews: true,
    //           can_change_info: true,
    //           can_invite_users: true,
    //           can_pin_messages: true
    //       },{
    //           until_date: (new Date().getTime() ) / 1000,
    //       })
    //   }else{
    //       console.log('false')
    //       slimbot.deleteMessage(chat.id, message_id)
    //       slimbot.kickChatMember(chat.id, new_chat_member.id,{
    //           until_date:0,
    //       })
    //   }
    // },  10*1000)
  }
});

// Call API

slimbot.startPolling();


module.exports = slimbot