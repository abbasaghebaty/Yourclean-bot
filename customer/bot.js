export async function handleCallback(callbackQuery, token) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const session = getSession(chatId);

  await callApi(token, 'answerCallbackQuery', {
    callback_query_id: callbackQuery.id
  });

  try {
    // فقط دکمه‌های کاربر عادی
    if (data === 'contact') {
      pushState(session, 'contact');
      await editState(chatId, messageId, 'contact', token);
    } 
    else if (data === 'address') {
      pushState(session, 'address');
      await editState(chatId, messageId, 'address', token);
    } 
    else if (data === 'phone') {
      pushState(session, 'phone');
      await editState(chatId, messageId, 'phone', token);
    } 
    else if (data === 'main_menu') {
      session.stack = ['main'];
      await sendMainMenu(chatId, token);
      try {
        await callApi(token, 'deleteMessage', {
          chat_id: chatId,
          message_id: messageId
        });
      } catch (e) {}
    }
    else if (data.startsWith('faq:q:')) {
      const index = parseInt(data.split(':')[2], 10);
      const item = CONFIG.faq[index];
      if (!item) return;
      
      let text = `❓ ${item.q}\n\n${item.a}`;
      let inlineKeyboard;
      
      if (index === 2) {
        text = `❓ ${item.q}\n\n${item.a}\n\n📞 شماره تماس:\n${CONFIG.phone}\n\n🆔 آیدی پشتیبانی:\n${CONFIG.supportId}`;
        inlineKeyboard = faqContactKeyboard();
      } else {
        inlineKeyboard = faqDetailKeyboard();
      }
      
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        reply_markup: inlineKeyboard
      });
    } 
    else if (data === 'faq_list') {
      if (!session.stack.includes('faq_list')) {
        pushState(session, 'faq_list');
      }
      await editState(chatId, messageId, 'faq_list', token);
    }
  } catch (error) {
    console.error('Callback error:', error);
    await callApi(token, 'sendMessage', {
      chat_id: chatId,
      text: 'متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید یا /start را بزنید.'
    });
  }
}