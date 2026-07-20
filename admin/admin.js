import { CONFIG } from '../customer/config.js';
import { sendMainMenu, handleMessage } from '../customer/bot.js';
import { adminMainKeyboard, backToAdminKeyboard } from './keyboards.js';
import { getTotalUsers, getTodayUsers, getTodayOrders, broadcastMessage } from './database.js';

const adminSessions = new Map();

function getAdminSession(chatId) {
  if (!adminSessions.has(chatId)) {
    adminSessions.set(chatId, null); // null یعنی خارج از پنل
  }
  return adminSessions.get(chatId);
}

function setAdminSession(chatId, session) {
  adminSessions.set(chatId, session);
}

export async function handleAdminMessage(message, token, env) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const session = getAdminSession(chatId);

  // اگر کاربر ادمین در حالت عادی است (session null) و دستور /admin را ارسال نکرده،
  // درخواست را به ربات مشتری ارجاع بده
  if (!session && text !== '/admin') {
    return handleMessage(message, token, env);
  }

  // ورود به پنل مدیریت یا بازگشت به منوی اصلی ادمین
  if (text === '/admin' || text === '🔙 بازگشت به منوی مدیریت') {
    setAdminSession(chatId, { state: 'main' });
    return sendAdminMenu(chatId, token);
  }

  // اگر در حالت انتظار برای دریافت متن پیام همگانی هستیم
  if (session && session.state === 'awaiting_broadcast_message') {
    // پیام کاربر را به عنوان متن همگانی می‌فرستیم
    setAdminSession(chatId, { state: 'main' }); // بازگشت به حالت عادی
    await sendMessage(chatId, token, '📣 در حال ارسال پیام همگانی... لطفاً شکیبا باشید.');
    const { success, fail } = await broadcastMessage(env, token, text);
    await sendMessage(chatId, token, `✅ پیام همگانی به ${success} نفر ارسال شد.\n❌ ناموفق: ${fail}`);
    return sendAdminMenu(chatId, token);
  }

  // سایر پیام‌های متنی در پنل ادمین
  return sendAdminMenu(chatId, token);
}

export async function handleAdminCallback(callbackQuery, token, env) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const session = getAdminSession(chatId);

  await answerCallback(token, callbackQuery.id);

  try {
    switch (data) {
      case 'admin_main':
        setAdminSession(chatId, { state: 'main' });
        return editAdminMenu(chatId, messageId, token);

      case 'admin_total_users': {
        const count = await getTotalUsers(env);
        return editMessageWithBack(chatId, messageId, token, `👥 تعداد کل کاربران: ${count}`);
      }

      case 'admin_today_users': {
        const count = await getTodayUsers(env);
        return editMessageWithBack(chatId, messageId, token, `📅 کاربران امروز: ${count}`);
      }

      case 'admin_today_orders': {
        const count = await getTodayOrders(env);
        return editMessageWithBack(chatId, messageId, token, `📦 سفارشات امروز: ${count}`);
      }

      case 'admin_broadcast':
        setAdminSession(chatId, { state: 'awaiting_broadcast_message' });
        return editMessageText(chatId, messageId, token, '📝 لطفاً متن پیام همگانی خود را ارسال کنید:');

      case 'admin_exit':
        setAdminSession(chatId, null); // خروج از پنل
        await sendMessage(chatId, token, '🚪 شما از پنل مدیریت خارج شدید.');
        return sendMainMenu(chatId, token); // بازگشت به منوی کاربری

      default:
        break;
    }
  } catch (error) {
    console.error('Admin callback error:', error);
    await sendMessage(chatId, token, '❌ خطایی رخ داد. لطفاً دوباره تلاش کنید.');
  }
}

// ---------- توابع کمکی ----------
async function sendAdminMenu(chatId, token) {
  const text = '🔐 پنل مدیریت\nلطفاً یک گزینه را انتخاب کنید:';
  await sendMessageWithKeyboard(chatId, token, text, adminMainKeyboard());
}

async function editAdminMenu(chatId, messageId, token) {
  const text = '🔐 پنل مدیریت\nلطفاً یک گزینه را انتخاب کنید:';
  await editMessageWithKeyboard(chatId, messageId, token, text, adminMainKeyboard());
}

async function editMessageWithBack(chatId, messageId, token, text) {
  await editMessageWithKeyboard(chatId, messageId, token, text, backToAdminKeyboard());
}

async function sendMessageWithKeyboard(chatId, token, text, keyboard) {
  await callApi(token, 'sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: keyboard
  });
}

async function editMessageWithKeyboard(chatId, messageId, token, text, keyboard) {
  await callApi(token, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: keyboard
  });
}

async function editMessageText(chatId, messageId, token, text) {
  await callApi(token, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text
  });
}

async function sendMessage(chatId, token, text) {
  await callApi(token, 'sendMessage', {
    chat_id: chatId,
    text
  });
}

async function answerCallback(token, callbackQueryId) {
  await callApi(token, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId
  });
}

async function callApi(token, method, body) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!data.ok) {
    console.error(`Telegram API error (${method}):`, data.description);
  }
  return data;
}