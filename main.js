// شما شاپ - ربات تلگرام فروشگاهی
// قابل اجرا روی Cloudflare Workers
// بدون نیاز به هیچ کتابخانه اضافی

// ================== تنظیمات فروشگاه (قابل تغییر) ==================
const CONFIG = {
  shopName: "شما شاپ",
  address: "مشهد ، بین هنور ۲۰ و ۲۲",
  phone: "09154819081",
  supportId: "@shoma_shop_sup",
  eitaaUrl: "https://eitaa.com/shoma_shop",
  rubikaUrl: "https://rubika.ir/shoma_shop",
  instagramUrl: "https://instagram.com/shoma_shop.ir",
  neshanUrl: "شوینده بهداشتی شما
https://nshn.ir/35Qb1MaUIJjDVc",
  googleMapsUrl: "https://maps.app.goo.gl/Haixv2k28U9JJi878",
  aboutText: `🏪 فروشگاه شما شاپ\n\nعرضه‌کننده انواع پوشاک زنانه و مردانه با بهترین کیفیت و مناسب‌ترین قیمت.\nرضایت شما افتخار ماست.`,
  faq: [
    { q: "ساعات کاری فروشگاه؟", a: "شنبه تا پنجشنبه 
از ساعت ۹ تا ۱۴ و ۱۷تا ۲۲" },
    { q: "روش‌های ارسال سفارش؟", a: "ارسال رایگان در محدوده
ارسال درون شهری با اسنپ باکس
و سراسر کشور با پست پیشتاز" },
    
  ]
};

// ================== ذخیره‌سازی جلسات در حافظه ==================
// در محیط serverless به صورت موقت نگهداری می‌شود.
// برای نسخه نهایی می‌توان از KV استفاده کرد.
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { stack: ['main'] });
  }
  return sessions.get(chatId);
}

// ================== ابزارهای ارتباط با Telegram API ==================
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

// ================== کیبوردها ==================

// کیبورد اصلی (پایین چت)
function mainReplyKeyboard() {
  return {
    keyboard: [
      [{ text: '📦 دریافت لیست محصولات' }, { text: '☎️ راه‌های ارتباطی' }],
      [{ text: '📝 راهنمای ثبت سفارش' }],
      [{ text: '🏪 درباره ما' }, { text: '❓ سوالات متداول' }],
      [{ text: '🔙 بازگشت' }, { text: '🏠 منوی اصلی' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

// ================== توابع ارسال / ویرایش پیام ==================

async function sendMainMenu(chatId, token) {
  const text = `🏪 به فروشگاه **${CONFIG.shopName}** خوش آمدید\n\nلطفاً گزینه مورد نظر خود را انتخاب کنید.`;
  const replyMarkup = mainReplyKeyboard();
  await callApi(token, 'sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
    reply_markup: replyMarkup
  });
}

async function sendState(chatId, state, token) {
  switch (state) {
    case 'main':
      await sendMainMenu(chatId, token);
      break;

    case 'products': {
      const text = 'برای مشاهده لیست محصولات، عکس‌ها و قیمت‌های به‌روز می‌توانید عضو کانال‌های ما شوید.';
      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '📱 ایتا', url: CONFIG.eitaaUrl },
            { text: '📱 روبیکا', url: CONFIG.rubikaUrl }
          ],
          [{ text: '📸 اینستاگرام', url: CONFIG.instagramUrl }]
        ]
      };
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: inlineKeyboard
      });
      break;
    }

    case 'guide': {
      const text = `📝 راهنمای ثبت سفارش\n\nابتدا محصولات و قیمت‌های به‌روز را از کانال‌های ما مشاهده کنید.\nپس از انتخاب کالا، برای ثبت سفارش از طریق راه‌های ارتباطی با ما تماس بگیرید.\nبا افتخار پاسخگوی شما هستیم.`;
      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '📱 ایتا', url: CONFIG.eitaaUrl },
            { text: '📱 روبیکا', url: CONFIG.rubikaUrl }
          ],
          [{ text: '☎️ راه‌های ارتباطی', callback_data: 'contact' }]
        ]
      };
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: inlineKeyboard
      });
      break;
    }

    case 'contact': {
      const text = '☎️ راه‌های ارتباطی\n\nیکی از گزینه‌های زیر را انتخاب کنید:';
      const inlineKeyboard = {
        inline_keyboard: [
          [{ text: '📍 آدرس فروشگاه', callback_data: 'address' }],
          [{ text: '📞 شماره تماس و پشتیبانی', callback_data: 'phone' }]
        ]
      };
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: inlineKeyboard
      });
      break;
    }

    case 'address': {
      const text = `📍 آدرس فروشگاه\n\nآدرس فروشگاه:\n${CONFIG.address}\n\nبرای مسیریابی یکی از گزینه‌های زیر را انتخاب کنید:`;
      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '🗺 مسیریابی در نشان', url: CONFIG.neshanUrl },
            { text: '📍 مسیریابی در گوگل مپ', url: CONFIG.googleMapsUrl }
          ]
        ]
      };
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
        // بدون inline keyboard
      });
      break;
    }

    case 'about': {
      const text = CONFIG.aboutText;
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text
      });
      break;
    }

    case 'faq_list': {
      const text = '❓ سوالات متداول\n\nلطفاً سوال خود را انتخاب کنید:';
      const inlineKeyboard = {
        inline_keyboard: CONFIG.faq.map((item, idx) => [{
          text: item.q,
          callback_data: `faq:q:${idx}`
        }])
      };
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: inlineKeyboard
      });
      break;
    }

    default:
      // در صورت نامعتبر بودن state، به منوی اصلی برگردان
      await sendMainMenu(chatId, token);
  }
}

// ================== مدیریت ناوبری ==================
function pushState(session, newState) {
  session.stack.push(newState);
}

function popState(session) {
  if (session.stack.length > 1) {
    session.stack.pop();
    return session.stack[session.stack.length - 1];
  }
  return 'main';
}

// ================== پردازش پیام‌های متنی ==================
async function handleMessage(message, token) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const session = getSession(chatId);

  // مدیریت دستور /start
  if (text === '/start') {
    session.stack = ['main'];
    await sendMainMenu(chatId, token);
    return;
  }

  // کلیک روی دکمه‌های Reply Keyboard (متنی)
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
      // ارسال پیام جدید برای حالت قبلی
      await sendState(chatId, previousState, token);
      break;
    }

    default:
      // پیام ناشناخته
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: 'دستور نامعتبر. لطفاً از دکمه‌های منو استفاده کنید یا /start را بزنید.'
      });
      // همچنین می‌توانیم منوی اصلی را دوباره ارسال کنیم تا کیبورد برگردد
      await sendMainMenu(chatId, token);
  }
}

// ================== پردازش Callback Query (دکمه‌های Inline) ==================
async function handleCallback(callbackQuery, token) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const session = getSession(chatId);

  // پاسخ اولیه به تلگرام برای بستن وضعیت "در حال پردازش"
  await callApi(token, 'answerCallbackQuery', {
    callback_query_id: callbackQuery.id
  });

  try {
    if (data === 'contact') {
      // برو به state تماس
      pushState(session, 'contact');
      await sendState(chatId, 'contact', token);
    } else if (data === 'address') {
      pushState(session, 'address');
      await sendState(chatId, 'address', token);
    } else if (data === 'phone') {
      pushState(session, 'phone');
      await sendState(chatId, 'phone', token);
    } else if (data.startsWith('faq:q:')) {
      const index = parseInt(data.split(':')[2], 10);
      const item = CONFIG.faq[index];
      if (!item) return;
      const text = `❓ ${item.q}\n\n✅ ${item.a}`;
      const inlineKeyboard = {
        inline_keyboard: [[
          { text: '🔙 بازگشت به سوالات', callback_data: 'faq_list' }
        ]]
      };
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        reply_markup: inlineKeyboard
      });
      // بدون تغییر در stack
    } else if (data === 'faq_list') {
      // برگشت به لیست سوالات
      const text = '❓ سوالات متداول\n\nلطفاً سوال خود را انتخاب کنید:';
      const inlineKeyboard = {
        inline_keyboard: CONFIG.faq.map((item, idx) => [{
          text: item.q,
          callback_data: `faq:q:${idx}`
        }])
      };
      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        reply_markup: inlineKeyboard
      });
      // در صورت نیاز stack را به faq_list بر می‌گردانیم
      // اما اگر قبلاً faq_list بوده تغییری نکند، اگر نبوده push می‌کنیم
      if (session.stack[session.stack.length - 1] !== 'faq_list') {
        pushState(session, 'faq_list');
      } else {
        // اطمینان از اینکه stack درست است
        session.stack = session.stack.filter(s => s !== 'faq_list');
        session.stack.push('faq_list');
      }
    }
  } catch (error) {
    console.error('Callback error:', error);
    await callApi(token, 'sendMessage', {
      chat_id: chatId,
      text: 'متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید یا /start را بزنید.'
    });
  }
}

// ================== ورودی اصلی Worker ==================
export default {
  async fetch(request, env) {
    // فقط درخواست‌های POST پردازش شوند
    if (request.method !== 'POST') {
      return new Response('OK');
    }

    const token = env.BOT_TOKEN;
    if (!token) {
      return new Response('BOT_TOKEN is not set in environment variables.', { status: 500 });
    }

    let update;
    try {
      update = await request.json();
    } catch (e) {
      return new Response('Invalid JSON', { status: 400 });
    }

    // پردازش هم‌روند به تلگرام پاسخ دهیم
    try {
      if (update.message) {
        await handleMessage(update.message, token);
      } else if (update.callback_query) {
        await handleCallback(update.callback_query, token);
      }
    } catch (error) {
      console.error('Unhandled error:', error);
    }

    // همیشه 200 برگردانیم تا تلگرام ارسال مجدد نکند
    return new Response('OK');
  }
};