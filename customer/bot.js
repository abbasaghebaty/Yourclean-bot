import { CONFIG } from './config.js';
import {
  mainReplyKeyboard,
  productsKeyboard,
  guideKeyboard,
  contactKeyboard,
  addressKeyboard,
  faqListKeyboard,
  faqDetailKeyboard,
  faqContactKeyboard
} from './keyboards.js';
import { saveUserToDB } from './database.js';

// ==============================================
// 📞 صدا زدن API تلگرام
// ==============================================
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

// ==============================================
// 🧠 مدیریت Session با KV
// ==============================================
async function getSession(chatId, env) {
  try {
    const raw = await env.RATE_LIMITER.get(`session:${chatId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return { stack: ['main'] };
}

async function saveSession(chatId, session, env) {
  await env.RATE_LIMITER.put(`session:${chatId}`, JSON.stringify(session), {
    expirationTtl: 3600 // 1 ساعت
  });
}

async function pushState(chatId, newState, env) {
  const session = await getSession(chatId, env);
  session.stack.push(newState);
  await saveSession(chatId, session, env);
  return session;
}

async function popState(chatId, env) {
  const session = await getSession(chatId, env);
  if (session.stack.length > 1) {
    session.stack.pop();
    await saveSession(chatId, session, env);
    return session.stack[session.stack.length - 1];
  }
  return 'main';
}

async function resetSession(chatId, env) {
  const session = { stack: ['main'] };
  await saveSession(chatId, session, env);
  return session;
}

// ==============================================
// 🏠 ارسال منوی اصلی
// ==============================================
export async function sendMainMenu(chatId, token) {
  const text = `🏪 به ${CONFIG.shopName} خوش آمدید\n\n🛍️ کیفیت، قیمت مناسب و خریدی مطمئن\nلطفاً یکی از گزینه‌های زیر را انتخاب کنید.`;
  const replyMarkup = mainReplyKeyboard();
  await callApi(token, 'sendMessage', {
    chat_id: chatId,
    text: text,
    reply_markup: replyMarkup
  });
}

// ==============================================
// 📤 ارسال منو بر اساس State
// ==============================================
async function sendState(chatId, state, token) {
  switch (state) {
    case 'main':
      await sendMainMenu(chatId, token);
      break;

    case 'products': {
      const text = 'برای مشاهده لیست محصولات، عکس‌ها و قیمت‌های به‌روز می‌توانید عضو کانال‌های ما شوید.';
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: productsKeyboard(CONFIG)
      });
      break;
    }

    case 'guide': {
      const text = `📝 <b>راهنمای ثبت سفارش</b>\n\nابتدا محصولات و قیمت‌های <b>به‌روز</b> را از <b>کانال‌های ما</b> مشاهده کنید.\nپس از انتخاب کالا، برای ثبت سفارش از طریق <b>راه‌های ارتباطی</b> با ما تماس بگیرید.\nبا افتخار پاسخگوی شما هستیم.`;
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: guideKeyboard(CONFIG)
      });
      break;
    }

    case 'contact': {
      const text = '☎️ راه‌های ارتباطی\n\nیکی از گزینه‌های زیر را انتخاب کنید:';
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: contactKeyboard()
      });
      break;
    }

    case 'address': {
      const text = `📍 آدرس فروشگاه\n\nآدرس فروشگاه:\n${CONFIG.address}\n\nبرای مسیریابی یکی از گزینه‌های زیر را انتخاب کنید:`;
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: addressKeyboard(CONFIG)
      });
      break;
    }

    case 'phone': {
      const text = `📞 تماس و پشتیبانی\n\nشماره تماس:\n${CONFIG.phone}\n\nآیدی پشتیبانی:\n${CONFIG.supportId}`;
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text
      });
      break;
    }

    case 'about': {
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: CONFIG.aboutText,
        parse_mode: 'HTML'
      });
      break;
    }

    case 'faq_list': {
      const text = '❓ سوالات متداول\n\nلطفاً سوال خود را انتخاب کنید:';
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: faqListKeyboard(CONFIG.faq)
      });
      break;
    }

    default:
      await sendMainMenu(chatId, token);
  }
}

// ==============================================
// ✏️ ادیت پیام بر اساس State
// ==============================================
async function editState(chatId, messageId, state, token) {
  switch (state) {
    case 'contact': {
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: '☎️ راه‌های ارتباطی\n\nیکی از گزینه‌های زیر را انتخاب کنید:',
        reply_markup: contactKeyboard()
      });
      break;
    }
    case 'address': {
      const text = `📍 آدرس فروشگاه\n\nآدرس فروشگاه:\n${CONFIG.address}\n\nبرای مسیریابی یکی از گزینه‌های زیر را انتخاب کنید:`;
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        reply_markup: addressKeyboard(CONFIG)
      });
      break;
    }
    case 'phone': {
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: `📞 تماس و پشتیبانی\n\nشماره تماس:\n${CONFIG.phone}\n\nآیدی پشتیبانی:\n${CONFIG.supportId}`
      });
      break;
    }
    case 'faq_list': {
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: '❓ سوالات متداول\n\nلطفاً سوال خود را انتخاب کنید:',
        reply_markup: faqListKeyboard(CONFIG.faq)
      });
      break;
    }
  }
}

// ==============================================
// 📩 هندلر پیام‌های کاربر عادی
// ==============================================
export async function handleMessage(message, token, env) {
  const chatId = message.chat.id;
  const text = message.text || '';

  await saveUserToDB(env, message.from);

  if (text === '/start') {
    await resetSession(chatId, env);
    await sendMainMenu(chatId, token);
    return;
  }

  switch (text) {
    case '🏠 منوی اصلی':
      await resetSession(chatId, env);
      await sendMainMenu(chatId, token);
      break;

    case '📦 دریافت لیست محصولات':
      await pushState(chatId, 'products', env);
      await sendState(chatId, 'products', token);
      break;

    case '☎️ راه‌های ارتباطی':
      await pushState(chatId, 'contact', env);
      await sendState(chatId, 'contact', token);
      break;

    case '📝 راهنمای ثبت سفارش':
      await pushState(chatId, 'guide', env);
      await sendState(chatId, 'guide', token);
      break;

    case '🏪 درباره ما':
      await pushState(chatId, 'about', env);
      await sendState(chatId, 'about', token);
      break;

    case '❓ سوالات متداول':
      await pushState(chatId, 'faq_list', env);
      await sendState(chatId, 'faq_list', token);
      break;

    case '🔙 بازگشت': {
      const previousState = await popState(chatId, env);
      await sendState(chatId, previousState, token);
      break;
    }

    default:
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: 'دستور نامعتبر. لطفاً از دکمه‌های منو استفاده کنید یا /start را بزنید.'
      });
      await sendMainMenu(chatId, token);
  }
}

// ==============================================
// 🔘 هندلر دکمه‌های شیشه‌ای کاربر عادی
// ==============================================
export async function handleCallback(callbackQuery, token, env) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  await callApi(token, 'answerCallbackQuery', {
    callback_query_id: callbackQuery.id
  });

  try {
    if (data === 'contact') {
      await pushState(chatId, 'contact', env);
      await editState(chatId, messageId, 'contact', token);
    }
    else if (data === 'address') {
      await pushState(chatId, 'address', env);
      await editState(chatId, messageId, 'address', token);
    }
    else if (data === 'phone') {
      await pushState(chatId, 'phone', env);
      await editState(chatId, messageId, 'phone', token);
    }
    else if (data === 'main_menu') {
      await resetSession(chatId, env);
      await sendMainMenu(chatId, token);
      try {
        await callApi(token, 'deleteMessage', { chat_id: chatId, message_id: messageId });
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
      await pushState(chatId, 'faq_list', env);
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