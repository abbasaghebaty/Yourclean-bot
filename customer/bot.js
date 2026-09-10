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
  faqDetailKeyboard
} from './keyboards.js';

import { saveUserToDB } from './database.js';


function getToken(env) {
  return (
    env.BOT_TOKEN ||
    env.TELEGRAM_BOT_TOKEN
  );
}


async function callApi(
  token,
  method,
  body
) {
  if (!token) {
    throw new Error(
      'Telegram bot token is missing.'
    );
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json'
      },

      body: JSON.stringify(body)
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Telegram API returned invalid JSON for ${method}.`
    );
  }

  if (
    !response.ok ||
    !result.ok
  ) {
    throw new Error(
      `Telegram API error in ${method}: ` +
      `${result.description || response.statusText}`
    );
  }

  return result.result;
}


/*
 * Session
 */

async function getStack(
  env,
  userId
) {
  const raw =
    await env.RATE_LIMITER.get(
      `session:${userId}`
    );

  if (!raw) {
    return ['main'];
  }

  try {
    const stack =
      JSON.parse(raw);

    return (
      Array.isArray(stack) &&
      stack.length
    )
      ? stack
      : ['main'];
  } catch {
    return ['main'];
  }
}


async function saveStack(
  env,
  userId,
  stack
) {
  await env.RATE_LIMITER.put(
    `session:${userId}`,
    JSON.stringify(stack),
    {
      expirationTtl: 3600
    }
  );
}


async function pushState(
  env,
  userId,
  state
) {
  const stack =
    await getStack(
      env,
      userId
    );

  stack.push(state);

  await saveStack(
    env,
    userId,
    stack
  );
}


async function replaceState(
  env,
  userId,
  state
) {
  const stack =
    await getStack(
      env,
      userId
    );

  stack[stack.length - 1] =
    state;

  await saveStack(
    env,
    userId,
    stack
  );
}


async function clearState(
  env,
  userId
) {
  await saveStack(
    env,
    userId,
    ['main']
  );
}


/*
 * Send state
 */

async function sendState(
  env,
  token,
  chatId,
  userId,
  state
) {
  await replaceState(
    env,
    userId,
    state
  );

  switch (state) {
    case 'main': {
      await callApi(
        token,
        'sendMessage',
        {
          chat_id: chatId,

          text:
            `🧼 <b>${CONFIG.shopName}</b>\n\n` +
            `به فروشگاه شوینده بهداشتی «شما» خوش آمدید.\n\n` +
            `از منوی زیر می‌توانید محصولات، اطلاعات فروشگاه، راه‌های ارتباطی و سوالات متداول را مشاهده کنید.`,

          parse_mode: 'HTML',

          reply_markup:
            mainReplyKeyboard()
        }
      );

      return;
    }


    case 'products': {
      await callApi(
        token,
        'sendMessage',
        {
          chat_id: chatId,

          text:
            `📦 <b>مشاهده محصولات</b>\n\n` +
            `لیست محصولات و قیمت‌های به‌روز فروشگاه در کانال‌های رسمی ما در ایتا و روبیکا قرار می‌گیرد.\n\n` +
            `برای مشاهده محصولات، عکس‌ها و قیمت‌های فعلی، کانال موردنظر خود را انتخاب کنید:`,

          parse_mode: 'HTML',

          reply_markup:
            productsKeyboard(CONFIG)
        }
      );

      return;
    }


    case 'trust': {
      await callApi(
        token,
        'sendMessage',
        {
          chat_id: chatId,

          text:
            `🛡️ <b>اعتماد و اعتبار فروشگاه</b>\n\n` +
            `فروشگاه شوینده بهداشتی «شما» دارای وب‌سایت رسمی است و اطلاعات و اعتبار فروشگاه را می‌توانید از طریق لینک‌های رسمی زیر بررسی کنید.\n\n` +
            `همچنین فروشگاه ما به‌صورت حضوری فعالیت دارد و امکان مراجعه حضوری و خرید از فروشگاه وجود دارد.\n\n` +
            `📍 <b>آدرس فروشگاه:</b>\n` +
            `${CONFIG.address}\n\n` +
            `برای بررسی وب‌سایت و نماد اعتماد الکترونیکی، گزینه موردنظر را انتخاب کنید:`,

          parse_mode: 'HTML',

          reply_markup:
            trustKeyboard(CONFIG)
        }
      );

      return;
    }


    case 'guide': {
      await callApi(
        token,
        'sendMessage',
        {
          chat_id: chatId,

          text:
            `📝 <b>راهنمای ثبت سفارش</b>\n\n` +
            `برای ثبت سفارش یا دریافت اطلاعات درباره محصولات، از طریق آیدی پشتیبانی با ما در ارتباط باشید.\n\n` +
            `📞 <b>آیدی پشتیبانی و ثبت سفارش:</b>\n` +
            `${CONFIG.supportId}`,

          parse_mode: 'HTML',

          reply_markup:
            guideKeyboard()
        }
      );

      return;
    }


    case 'contact': {
      await callApi(
        token,
        'sendMessage',
        {
          chat_id: chatId,

          text:
            `☎️ <b>راه‌های ارتباطی</b>\n\n` +
            `برای ارتباط با فروشگاه می‌توانید از گزینه‌های زیر استفاده کنید.`,

          parse_mode: 'HTML',

          reply_markup:
            contactKeyboard()
        }
      );

      return;
    }


    case 'address': {
      await callApi(
        token,
        'sendMessage',
        {
          chat_id: chatId,

          text:
            `📍 <b>آدرس فروشگاه</b>\n\n` +
            `${CONFIG.address}\n\n` +
            `برای مسیریابی، یکی از گزینه‌های زیر را انتخاب کنید:`,

          parse_mode: 'HTML',

          reply_markup:
            addressKeyboard(CONFIG)
        }
      );

      return;
    }


    case 'phone': {
      await callApi(
        token,
        'sendMessage',
        {
          chat_id: chatId,

          text:
            `☎️ <b>شماره تماس فروشگاه</b>\n\n` +
            `${CONFIG.phone}`,

          parse_mode: 'HTML',

          reply_markup:
            phoneKeyboard()
        }
      );

      return;
    }


    case 'faq': {
      await callApi(
        token,
        'sendMessage',
        {
          chat_id: chatId,

          text:
            `❓ <b>سوالات متداول</b>\n\n` +
            `موضوع موردنظر خود را انتخاب کنید:`,

          parse_mode: 'HTML',

          reply_markup:
            faqListKeyboard(CONFIG)
        }
      );

      return;
    }


    default: {
      await sendState(
        env,
        token,
        chatId,
        userId,
        'main'
      );
    }
  }
}


/*
 * Edit callback message
 */

async function editState(
  env,
  token,
  chatId,
  messageId,
  userId,
  state
) {
  await replaceState(
    env,
    userId,
    state
  );

  let text;
  let replyMarkup;

  switch (state) {
    case 'main':
      text =
        `🧼 <b>${CONFIG.shopName}</b>\n\n` +
        `از منوی زیر می‌توانید بخش موردنظر خود را انتخاب کنید.`;

      replyMarkup =
        mainReplyKeyboard();

      break;


    case 'contact':
      text =
        `☎️ <b>راه‌های ارتباطی</b>\n\n` +
        `برای ارتباط با فروشگاه می‌توانید از گزینه‌های زیر استفاده کنید.`;

      replyMarkup =
        contactKeyboard();

      break;


    case 'address':
      text =
        `📍 <b>آدرس فروشگاه</b>\n\n` +
        `${CONFIG.address}\n\n` +
        `برای مسیریابی، یکی از گزینه‌های زیر را انتخاب کنید.`;

      replyMarkup =
        addressKeyboard(CONFIG);

      break;


    case 'phone':
      text =
        `☎️ <b>شماره تماس فروشگاه</b>\n\n` +
        `${CONFIG.phone}`;

      replyMarkup =
        phoneKeyboard();

      break;


    case 'faq':
      text =
        `❓ <b>سوالات متداول</b>\n\n` +
        `موضوع موردنظر خود را انتخاب کنید.`;

      replyMarkup =
        faqListKeyboard(CONFIG);

      break;


    default:
      return;
  }

  await callApi(
    token,
    'editMessageText',
    {
      chat_id: chatId,
      message_id: messageId,

      text,

      parse_mode: 'HTML',

      reply_markup:
        replyMarkup
    }
  );
}


/*
 * Messages
 */

export async function handleMessage(
  env,
  update
) {
  const token =
    getToken(env);

  const message =
    update.message;

  if (!message) {
    return;
  }

  const chatId =
    message.chat?.id;

  const userId =
    message.from?.id;

  if (!chatId || !userId) {
    return;
  }

  await saveUserToDB(
    env,
    message.from
  );

  const text =
    message.text?.trim();

  if (!text) {
    return;
  }

  switch (text) {
    case '/start':
    case 'شروع': {
      await clearState(
        env,
        userId
      );

      await sendState(
        env,
        token,
        chatId,
        userId,
        'main'
      );

      return;
    }


    case '📦 مشاهده محصولات': {
      await pushState(
        env,
        userId,
        'products'
      );

      await sendState(
        env,
        token,
        chatId,
        userId,
        'products'
      );

      return;
    }


    case '🛡️ اعتماد و اعتبار': {
      await pushState(
        env,
        userId,
        'trust'
      );

      await sendState(
        env,
        token,
        chatId,
        userId,
        'trust'
      );

      return;
    }


    case '☎️ راه‌های ارتباطی': {
      await pushState(
        env,
        userId,
        'contact'
      );

      await sendState(
        env,
        token,
        chatId,
        userId,
        'contact'
      );

      return;
    }


    case '📝 راهنمای ثبت سفارش': {
      await pushState(
        env,
        userId,
        'guide'
      );

      await sendState(
        env,
        token,
        chatId,
        userId,
        'guide'
      );

      return;
    }


    case '❓ سوالات متداول': {
      await pushState(
        env,
        userId,
        'faq'
      );

      await sendState(
        env,
        token,
        chatId,
        userId,
        'faq'
      );

      return;
    }


    default: {
      await sendState(
        env,
        token,
        chatId,
        userId,
        'main'
      );
    }
  }
}


/*
 * Callback queries
 */

export async function handleCallback(
  env,
  update
) {
  const token =
    getToken(env);

  const callback =
    update.callback_query;

  if (!callback) {
    return;
  }

  const chatId =
    callback.message?.chat?.id;

  const messageId =
    callback.message?.message_id;

  const userId =
    callback.from?.id;

  const data =
    callback.data;

  if (
    !chatId ||
    !messageId ||
    !userId ||
    !data
  ) {
    return;
  }

  /*
   * فقط یک بار callback را پاسخ می‌دهیم.
   */
  try {
    await callApi(
      token,
      'answerCallbackQuery',
      {
        callback_query_id:
          callback.id
      }
    );
  } catch (error) {
    console.error(
      'answerCallbackQuery failed:',
      error
    );
  }


  if (data === 'main') {
    await clearState(
      env,
      userId
    );

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


  if (data.startsWith('faq_')) {
    const index =
      Number.parseInt(
        data.slice(4),
        10
      );

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= CONFIG.faq.length
    ) {
      return;
    }

    const item =
      CONFIG.faq[index];

    await replaceState(
      env,
      userId,
      `faq_${index}`
    );

    await callApi(
      token,
      'editMessageText',
      {
        chat_id: chatId,
        message_id: messageId,

        text:
          `❓ <b>${item.q}</b>\n\n` +
          `${item.a}`,

        parse_mode: 'HTML',

        reply_markup:
          faqDetailKeyboard()
      }
    );
  }
}
