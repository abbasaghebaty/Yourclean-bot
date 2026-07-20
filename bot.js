import { CONFIG } from './config.js';
import { 
  mainReplyKeyboard, 
  productsKeyboard, 
  guideKeyboard, 
  contactKeyboard, 
  addressKeyboard, 
  faqListKeyboard, 
  faqDetailKeyboard 
} from './keyboards.js';
import { saveUserToDB } from './database.js';

const sessions = new Map();

export function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { stack: ['main'] });
  }
  return sessions.get(chatId);
}

export function pushState(session, newState) {
  session.stack.push(newState);
}

export function popState(session) {
  if (session.stack.length > 1) {
    session.stack.pop();
    return session.stack[session.stack.length - 1];
  }
  return 'main';
}

async function callApi(token, method, body) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const init = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
  const response = await fetch(url, init);
  const data = await response.json();
  if (!data.ok) {
    console.error(`Telegram API error (${method}):`, data.description);
  }
  return data;
}

export async function sendMainMenu(chatId, token) {
  const text = `🏪 به ${CONFIG.shopName} خوش آمدید

🛍️ کیفیت، قیمت مناسب و خریدی مطمئن
لطفاً یکی از گزینه‌های زیر را انتخاب کنید.`;
  const replyMarkup = mainReplyKeyboard();
  await callApi(token, 'sendMessage', {
    chat_id: chatId,
    text: text,
    reply_markup: replyMarkup
  });
}

export async function sendState(chatId, state, token) {
  switch (state) {
    case 'main':
      await sendMainMenu(chatId, token);
      break;

    case 'products': {
      const text = 'برای مشاهده لیست محصولات، عکس‌ها و قیمت‌های به‌روز می‌توانید عضو کانال‌های ما شوید.';
      const inlineKeyboard = productsKeyboard(CONFIG);
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: inlineKeyboard
      });
      break;
    }

    case 'guide': {
      const text = `📝 <b>راهنمای ثبت سفارش</b>\n\nابتدا محصولات و قیمت‌های <b>به‌روز</b> را از <b>کانال‌های ما</b> مشاهده کنید.\nپس از انتخاب کالا، برای ثبت سفارش از طریق <b>راه‌های ارتباطی</b> با ما تماس بگیرید.\nبا افتخار پاسخگوی شما هستیم.`;
      const inlineKeyboard = guideKeyboard(CONFIG);
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      });
      break;
    }

    case 'contact': {
      const text = '☎️ راه‌های ارتباطی\n\nیکی از گزینه‌های زیر را انتخاب کنید:';
      const inlineKeyboard = contactKeyboard();
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: inlineKeyboard
      });
      break;
    }

    case 'address': {
      const text = `📍 آدرس فروشگاه\n\nآدرس فروشگاه:\n${CONFIG.address}\n\nبرای مسیریابی یکی از گزینه‌های زیر را انتخاب کنید:`;
      const inlineKeyboard = addressKeyboard(CONFIG);
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: inlineKeyboard
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
      const text = CONFIG.aboutText;
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      });
      break;
    }

    case 'faq_list': {
      const text = '❓ سوالات متداول\n\nلطفاً سوال خود را انتخاب کنید:';
      const inlineKeyboard = faqListKeyboard(CONFIG.faq);
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      });
      break;
    }

    default:
      await sendMainMenu(chatId, token);
  }
}

export async function editState(chatId, messageId, state, token) {
  switch (state) {
    case 'contact': {
      const text = '☎️ راه‌های ارتباطی\n\nیکی از گزینه‌های زیر را انتخاب کنید:';
      const inlineKeyboard = contactKeyboard();
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        reply_markup: inlineKeyboard
      });
      break;
    }
    case 'address': {
      const text = `📍 آدرس فروشگاه\n\nآدرس فروشگاه:\n${CONFIG.address}\n\nبرای مسیریابی یکی از گزینه‌های زیر را انتخاب کنید:`;
      const inlineKeyboard = addressKeyboard(CONFIG);
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        reply_markup: inlineKeyboard
      });
      break;
    }
    case 'phone': {
      const text = `📞 تماس و پشتیبانی\n\nشماره تماس:\n${CONFIG.phone}\n\nآیدی پشتیبانی:\n${CONFIG.supportId}`;
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text
      });
      break;
    }
    case 'faq_list': {
      const text = '❓ سوالات متداول\n\nلطفاً سوال خود را انتخاب کنید:';
      const inlineKeyboard = faqListKeyboard(CONFIG.faq);
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        reply_markup: inlineKeyboard
      });
      break;
    }
    default:
      console.log('editState: unknown state', state);
  }
}

export async function handleMessage(message, token, env) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const session = getSession(chatId);

  // ذخیره اطلاعات کاربر در دیتابیس
  await saveUserToDB(env, message.from);

  if (text === '/start') {
    session.stack = ['main'];
    await sendMainMenu(chatId, token);
    return;
  }

  switch (text) {
    case '🏠 منوی اصلی':
      session.stack = ['main'];
      await sendMainMenu(chatId, token);
      break;

    case '📦 دریافت لیست محصولات':
      pushState(session, 'products');
      await sendState(chatId, 'products', token);
      break;

    case '☎️ راه‌های ارتباطی':
      pushState(session, 'contact');
      await sendState(chatId, 'contact', token);
      break;

    case '📝 راهنمای ثبت سفارش':
      pushState(session, 'guide');
      await sendState(chatId, 'guide', token);
      break;

    case '🏪 درباره ما':
      pushState(session, 'about');
      await sendState(chatId, 'about', token);
      break;

    case '❓ سوالات متداول':
      pushState(session, 'faq_list');
      await sendState(chatId, 'faq_list', token);
      break;

    case '🔙 بازگشت': {
      const previousState = popState(session);
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

export async function handleCallback(callbackQuery, token) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const session = getSession(chatId);

  await callApi(token, 'answerCallbackQuery', {
    callback_query_id: callbackQuery.id
  });

  try {
    if (data === 'contact') {
      pushState(session, 'contact');
      await editState(chatId, messageId, 'contact', token);
    } else if (data === 'address') {
      pushState(session, 'address');
      await editState(chatId, messageId, 'address', token);
    } else if (data === 'phone') {
      pushState(session, 'phone');
      await editState(chatId, messageId, 'phone', token);
    } else if (data.startsWith('faq:q:')) {
      const index = parseInt(data.split(':')[2], 10);
      const item = CONFIG.faq[index];
      if (!item) return;
      const text = `❓ ${item.q}\n\n${item.a}`;
      const inlineKeyboard = faqDetailKeyboard();
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        reply_markup: inlineKeyboard
      });
    } else if (data === 'faq_list') {
      if (session.stack[session.stack.length - 1] !== 'faq_list') {
        pushState(session, 'faq_list');
      } else {
        session.stack = session.stack.filter(s => s !== 'faq_list');
        session.stack.push('faq_list');
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