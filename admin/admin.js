import { sendMainMenu } from '../customer/bot.js';
import { adminMainKeyboard, backToAdminKeyboard } from './keyboards.js';
import { getTotalUsers, getTodayUsers, getTodayOrders, broadcastMessage } from './database.js';

const adminSessions = new Map();

function getAdminSession(chatId) {
  if (!adminSessions.has(chatId)) {
    adminSessions.set(chatId, null);
  }
  return adminSessions.get(chatId);
}

function setAdminSession(chatId, session) {
  adminSessions.set(chatId, session);
}

async function callApi(token, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await response.json();
}

async function sendAdminMenu(chatId, token) {
  await callApi(token, 'sendMessage', {
    chat_id: chatId,
    text: '🔐 پنل مدیریت\nلطفاً یک گزینه را انتخاب کنید:',
    reply_markup: adminMainKeyboard()
  });
}

export async function handleAdminMessage(message, token, env) {
  const chatId = message.chat.id;
  const text = message.text || '';

  if (text === '/admin') {
    setAdminSession(chatId, { state: 'main' });
    await sendAdminMenu(chatId, token);
    return;
  }

  const session = getAdminSession(chatId);

  if (!session || session.state !== 'awaiting_broadcast_message') {
    // ادمین توی پنل نیست، بفرست به بخش مشتری
    const { handleMessage } = await import('../customer/bot.js');
    await handleMessage(message, token, env);
    return;
  }

  if (session.state === 'awaiting_broadcast_message') {
    setAdminSession(chatId, { state: 'main' });
    await callApi(token, 'sendMessage', {
      chat_id: chatId,
      text: '📣 در حال ارسال پیام همگانی...'
    });
    const { success, fail } = await broadcastMessage(env, token, text);
    await callApi(token, 'sendMessage', {
      chat_id: chatId,
      text: `✅ ارسال به ${success} نفر\n❌ ناموفق: ${fail}`
    });
    await sendAdminMenu(chatId, token);
  }
}

export async function handleAdminCallback(callbackQuery, token, env) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  await callApi(token, 'answerCallbackQuery', {
    callback_query_id: callbackQuery.id
  });

  try {
    switch (data) {
      case 'admin_total_users': {
        const count = await getTotalUsers(env);
        await callApi(token, 'editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `👥 تعداد کل کاربران: ${count}`,
          reply_markup: backToAdminKeyboard()
        });
        break;
      }

      case 'admin_today_users': {
        const count = await getTodayUsers(env);
        await callApi(token, 'editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `📅 کاربران امروز: ${count}`,
          reply_markup: backToAdminKeyboard()
        });
        break;
      }

      case 'admin_today_orders': {
        const count = await getTodayOrders(env);
        await callApi(token, 'editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `📦 سفارشات امروز: ${count}`,
          reply_markup: backToAdminKeyboard()
        });
        break;
      }

      case 'admin_broadcast': {
        setAdminSession(chatId, { state: 'awaiting_broadcast_message' });
        await callApi(token, 'editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: '📝 لطفاً متن پیام همگانی خود را ارسال کنید:'
        });
        break;
      }

      case 'admin_main': {
        setAdminSession(chatId, { state: 'main' });
        await callApi(token, 'editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: '🔐 پنل مدیریت\nلطفاً یک گزینه را انتخاب کنید:',
          reply_markup: adminMainKeyboard()
        });
        break;
      }

      case 'admin_exit': {
        setAdminSession(chatId, null);
        await callApi(token, 'deleteMessage', {
          chat_id: chatId,
          message_id: messageId
        });
        await callApi(token, 'sendMessage', {
          chat_id: chatId,
          text: '🚪 شما از پنل مدیریت خارج شدید.'
        });
        await sendMainMenu(chatId, token);
        break;
      }
    }
  } catch (error) {
    console.error('Admin callback error:', error);
  }
}