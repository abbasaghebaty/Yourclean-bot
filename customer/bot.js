
import { CONFIG } from './config.js';

import {
  mainReplyKeyboard,
  productsKeyboard,
  trustKeyboard,
  guideKeyboard,
  contactKeyboard,
  addressKeyboard,
  phoneKeyboard,
  faqListKeyboard,
  faqDetailKeyboard,
  faqContactKeyboard
} from './keyboards.js';

import { saveUserToDB } from './database.js';

function getToken(env) {
  return env.BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
}

async function callApi(token, method, body) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  return response.json();
}

/**
 * Get current session stack from KV
 */
async function getStack(env, userId) {
  const raw = await env.RATE_LIMITER.get(`session:${userId}`);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save session stack
 */
async function saveStack(env, userId, stack) {
  await env.RATE_LIMITER.put(
    `session:${userId}`,
    JSON.stringify(stack),
    {
      expirationTtl: 3600
    }
  );
}

/**
 * Push a new state
 */
async function pushState(env, userId, state) {
  const stack = await getStack(env, userId);

  stack.push(state);

  await saveStack(env, userId, stack);

  return stack;
}

/**
 * Replace current state
 */
async function replaceState(env, userId, state) {
  const stack = await getStack(env, userId);

  if (stack.length) {
    stack[stack.length - 1] = state;
  } else {
    stack.push(state);
  }

  await saveStack(env, userId, stack);

  return stack;
}

/**
 * Go back one state
 */
async function popState(env, userId) {
  const stack = await getStack(env, userId);

  if (stack.length > 1) {
    stack.pop();
  } else {
    return ['main'];
  }

  await saveStack(env, userId, stack);

  return stack;
}

/**
 * Clear session and return to main
 */
async function clearState(env, userId) {
  await saveStack(env, userId, ['main']);
}

/**
 * Send a state
 */
async function sendState(env, token, chatId, userId, state) {
  await replaceState(env, userId, state);

  switch (state) {
    /**
     * MAIN
     */
    case 'main': {
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text:
          `🧼 <b>${CONFIG.shopName}</b>\n\n` +
          `به فروشگاه شوینده بهداشتی «شما» خوش آمدید.\n\n` +
          `از منوی زیر می‌توانید محصولات، اطلاعات فروشگاه، راه‌های ارتباطی و سوالات متداول را مشاهده کنید.`,
        parse_mode: 'HTML',
        reply_markup: mainReplyKeyboard()
      });

      break;
    }

    /**
     * PRODUCTS
     */
    case 'products': {
      const text =
        `📦 <b>مشاهده محصولات</b>\n\n` +
        `لیست محصولات و قیمت‌های به‌روز فروشگاه در کانال‌های رسمی ما در ایتا و روبیکا قرار می‌گیرد.\n\n` +
        `برای مشاهده محصولات، عکس‌ها و قیمت‌های فعلی، کانال موردنظر خود را انتخاب کنید:`;

      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: productsKeyboard(CONFIG)
      });

      break;
    }

    /**
     * TRUST
     */
    case 'trust': {
      const text =
        `🛡️ <b>اعتماد و اعتبار فروشگاه</b>\n\n` +
        `فروشگاه شوینده بهداشتی «شما» دارای وب‌سایت رسمی است و اطلاعات و اعتبار فروشگاه را می‌توانید از طریق لینک‌های رسمی زیر بررسی کنید.\n\n` +
        `همچنین فروشگاه ما به‌صورت حضوری فعالیت دارد و امکان مراجعه حضوری و خرید از فروشگاه وجود دارد.\n\n` +
        `📍 <b>آدرس فروشگاه:</b>\n` +
        `${CONFIG.address}\n\n` +
        `برای بررسی وب‌سایت و نماد اعتماد الکترونیکی، گزینه موردنظر را انتخاب کنید:`;

      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: trustKeyboard(CONFIG)
      });

      break;
    }

    /**
     * GUIDE
     */
    case 'guide': {
      const text =
        `📝 <b>راهنمای ثبت سفارش</b>\n\n` +
        `برای ثبت سفارش یا دریافت اطلاعات درباره محصولات، از طریق آیدی پشتیبانی با ما در ارتباط باشید.\n\n` +
        `📞 <b>آیدی پشتیبانی و ثبت سفارش:</b>\n` +
        `${CONFIG.supportId}`;

      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: guideKeyboard()
      });

      break;
    }

    /**
     * CONTACT
     */
    case 'contact': {
      const text =
        `☎️ <b>راه‌های ارتباطی</b>\n\n` +
        `برای ارتباط با فروشگاه می‌توانید از گزینه‌های زیر استفاده کنید.`;

      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: contactKeyboard()
      });

      break;
    }

    /**
     * ADDRESS
     */
    case 'address': {
      const text =
        `📍 <b>آدرس فروشگاه</b>\n\n` +
        `${CONFIG.address}\n\n` +
        `برای مسیریابی، یکی از گزینه‌های زیر را انتخاب کنید:`;

      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: addressKeyboard(CONFIG)
      });

      break;
    }

    /**
     * PHONE
     */
    case 'phone': {
      const text =
        `☎️ <b>شماره تماس فروشگاه</b>\n\n` +
        `${CONFIG.phone}`;

      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: phoneKeyboard()
      });

      break;
    }

    /**
     * FAQ
     */
    case 'faq': {
      const text =
        `❓ <b>سوالات متداول</b>\n\n` +
        `موضوع موردنظر خود را انتخاب کنید:`;

      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: faqListKeyboard(CONFIG)
      });

      break;
    }

    default: {
      await sendState(env, token, chatId, userId, 'main');
    }
  }
}

/**
 * Edit current callback message
 */
async function editState(
  env,
  token,
  chatId,
  messageId,
  userId,
  state
) {
  await replaceState(env, userId, state);

  let text = '';
  let reply_markup = undefined;

  switch (state) {
    case 'main': {
      text =
        `🧼 <b>${CONFIG.shopName}</b>\n\n` +
        `از منوی زیر می‌توانید بخش موردنظر خود را انتخاب کنید.`;

      reply_markup = mainReplyKeyboard();

      break;
    }

    case 'contact': {
      text =
        `☎️ <b>راه‌های ارتباطی</b>\n\n` +
        `برای ارتباط با فروشگاه می‌توانید از گزینه‌های زیر استفاده کنید.`;

      reply_markup = contactKeyboard();

      break;
    }

    case 'address': {
      text =
        `📍 <b>آدرس فروشگاه</b>\n\n` +
        `${CONFIG.address}\n\n` +
        `برای مسیریابی، یکی از گزینه‌های زیر را انتخاب کنید:`;

      reply_markup = addressKeyboard(CONFIG);

      break;
    }

    case 'phone': {
      text =
        `☎️ <b>شماره تماس فروشگاه</b>\n\n` +
        `${CONFIG.phone}`;

      reply_markup = phoneKeyboard();

      break;
    }

    case 'faq': {
      text =
        `❓ <b>سوالات متداول</b>\n\n` +
        `موضوع موردنظر خود را انتخاب کنید:`;

      reply_markup = faqListKeyboard(CONFIG);

      break;
    }

    default: {
      return;
    }
  }

  await callApi(token, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    reply_markup
  });
}

/**
 * Handle normal messages
 */
export async function handleMessage(env, update) {
  const token = getToken(env);

  const message = update.message;

  if (!message) {
    return;
  }

  const chatId = message.chat.id;
  const userId = message.from?.id;

  if (!userId) {
    return;
  }

  await saveUserToDB(env, message.from);

  const text = message.text?.trim();

  if (!text) {
    return;
  }

  switch (text) {
    case '/start':
    case 'شروع': {
      await clearState(env, userId);
      await sendState(env, token, chatId, userId, 'main');
      break;
    }

    case '📦 مشاهده محصولات': {
      await pushState(env, userId, 'products');
      await sendState(env, token, chatId, userId, 'products');
      break;
    }

    case '🛡️ اعتماد و اعتبار': {
      await pushState(env, userId, 'trust');
      await sendState(env, token, chatId, userId, 'trust');
      break;
    }

    case '☎️ راه‌های ارتباطی': {
      await pushState(env, userId, 'contact');
      await sendState(env, token, chatId, userId, 'contact');
      break;
    }

    case '📝 راهنمای ثبت سفارش': {
      await pushState(env, userId, 'guide');
      await sendState(env, token, chatId, userId, 'guide');
      break;
    }

    case '❓ سوالات متداول': {
      await pushState(env, userId, 'faq');
      await sendState(env, token, chatId, userId, 'faq');
      break;
    }

    case '🏪 درباره ما': {
      await pushState(env, userId, 'about');
      await sendState(env, token, chatId, userId, 'about');
      break;
    }

    default: {
      await sendState(env, token, chatId, userId, 'main');
      break;
    }
  }
}

/**
 * Handle inline callbacks
 */
export async function handleCallback(env, update) {
  const token = getToken(env);

  const callback = update.callback_query;

  if (!callback) {
    return;
  }

  const chatId = callback.message?.chat?.id;
  const messageId = callback.message?.message_id;
  const userId = callback.from?.id;
  const data = callback.data;

  if (!chatId || !messageId || !userId || !data) {
    return;
  }

  await callApi(token, 'answerCallbackQuery', {
    callback_query_id: callback.id
  });

  /**
   * MAIN
   */
  if (data === 'main') {
    await clearState(env, userId);

    await editState(
      env,
      token,
      chatId,
      messageId,
      userId,
      'main'
    );

    return;
  }

  /**
   * CONTACT
   */
  if (data === 'contact') {
    await editState(
      env,
      token,
      chatId,
      messageId,
      userId,
      'contact'
    );

    return;
  }

  /**
   * ADDRESS
   */
  if (data === 'address') {
    await editState(
      env,
      token,
      chatId,
      messageId,
      userId,
      'address'
    );

    return;
  }

  /**
   * PHONE
   */
  if (data === 'phone') {
    await editState(
      env,
      token,
      chatId,
      messageId,
      userId,
      'phone'
    );

    return;
  }

  /**
   * FAQ
   */
  if (data === 'faq') {
    await editState(
      env,
      token,
      chatId,
      messageId,
      userId,
      'faq'
    );

    return;
  }

  /**
   * FAQ item
   */
  if (data.startsWith('faq_')) {
    const index = Number(data.replace('faq_', ''));

    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < CONFIG.faq.length
    ) {
      await replaceState(env, userId, `faq_${index}`);

      const item = CONFIG.faq[index];

      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text:
          `❓ <b>${item.q}</b>\n\n` +
          `${item.a}`,
        parse_mode: 'HTML',
        reply_markup: faqDetailKeyboard()
      });
    }

    return;
  }

  /**
   * CONTACT PHONE
   */
  if (data === 'contact_phone') {
    await callApi(token, 'answerCallbackQuery', {
      callback_query_id: callback.id,
      url: `tel:${CONFIG.phone}`
    });

    return;
  }
}
```
