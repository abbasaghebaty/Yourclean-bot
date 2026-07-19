/**
 * ربات تلگرامی فروشگاه شما شاپ (Shoma Shop)
 * مناسب اجرا روی Cloudflare Workers
 * نسخه ۱.۰.۰
 */

// ==================== تنظیمات ====================

// اطلاعات فروشگاه (در صورت نیاز به تغییر، اینجا ویرایش کنید)
const SHOP_INFO = {
  name: "🏪 شما شاپ",
  about: "فروشگاه شما شاپ، مرکز تخصصی محصولات شوینده، بهداشتی و مصرفی با بهترین کیفیت و قیمت. هدف ما رضایت و آسایش شماست 🛍️",
  address: "📍 آدرس فروشگاه: ایران، تهران، خیابان نمونه، پلاک ۰۰۱", // آدرس دقیق را خودتان جایگزین کنید
  neshanUrl: "https://nshn.ir/357b1MaUIJjDVc",
  googleMapsUrl: "https://maps.app.goo.gl/SSvNCBAZcptxPWis8",
  supportId: "@Shoma_shop_sup",
  eitaa: "https://eitaa.com/shoma_shop",
  rubika: "https://rubika.ir/shoma_shop",
  instagram: "https://instagram.com/shoma_shop.ir",
  website: null, // بعداً لینک سایت فعال شود (کامنت)
};

// سوالات متداول (برای اضافه کردن سوال جدید، یک شیء به آرایه اضافه کنید)
const FAQS = [
  {
    q: "چطور سفارش ثبت کنم؟",
    a: "برای ثبت سفارش می‌توانید از طریق دکمه «پشتیبانی و ثبت سفارش» با ما در ارتباط باشید یا به آیدی @Shoma_shop_sup پیام دهید.",
  },
  {
    q: "آیا ارسال دارید؟",
    a: "بله، ارسال به سراسر کشور داریم. هزینه ارسال بر اساس مقصد محاسبه می‌شود.",
  },
  {
    q: "چطور قیمت محصولات را ببینم؟",
    a: "می‌توانید از طریق شبکه‌های اجتماعی و کانال‌های ما محصولات و قیمت‌ها را مشاهده کنید.",
  },
  {
    q: "ساعات کاری؟",
    a: "ساعات کاری:\nشنبه تا پنجشنبه: ۹ صبح تا ۸ شب\nجمعه‌ها: ۱۰ صبح تا ۲ بعدازظهر",
  },
  {
    q: "راه ارتباطی؟",
    a: "می‌توانید از طریق آیدی @Shoma_shop_sup در تلگرام یا دکمه پشتیبانی در ربات با ما ارتباط بگیرید.",
  },
];

// ==================== توابع کمکی Telegram API ====================

/**
 * ارسال درخواست به API تلگرام
 */
async function callTelegramAPI(token, method, body = {}) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

/**
 * ارسال پیام متنی
 */
async function sendMessage(token, chat_id, text, reply_markup = null) {
  const body = {
    chat_id,
    text,
    parse_mode: "HTML",
  };
  if (reply_markup) body.reply_markup = reply_markup;
  return callTelegramAPI(token, "sendMessage", body);
}

/**
 * ویرایش متن پیام
 */
async function editMessageText(token, chat_id, message_id, text, reply_markup = null) {
  const body = {
    chat_id,
    message_id,
    text,
    parse_mode: "HTML",
  };
  if (reply_markup) body.reply_markup = reply_markup;
  return callTelegramAPI(token, "editMessageText", body);
}

/**
 * پاسخ به callback query
 */
async function answerCallbackQuery(token, callback_query_id, text = "") {
  return callTelegramAPI(token, "answerCallbackQuery", {
    callback_query_id,
    text,
  });
}

/**
 * پاسخ به inline query
 */
async function answerInlineQuery(token, inline_query_id, results) {
  return callTelegramAPI(token, "answerInlineQuery", {
    inline_query_id,
    results,
    cache_time: 0,
  });
}

// ==================== کیبوردهای شیشه‌ای (Inline Keyboard) ====================

// منوی اصلی
function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🏪 درباره ما", callback_data: "about" }],
      [{ text: "📍 آدرس فروشگاه", callback_data: "address" }],
      [{ text: "📢 شبکه‌های اجتماعی", callback_data: "social" }],
      [{ text: "☎️ پشتیبانی و ثبت سفارش", callback_data: "support" }],
      [{ text: "❓ سوالات متداول", callback_data: "faq" }],
      // بعداً لینک سایت فعال شود
      // وقتی خواستید سایت را فعال کنید، کامنت خط زیر را بردارید و یک URL معتبر بدهید
      // [{ text: "🌐 سایت", url: "https://shomashop.ir" }],
      [{ text: "🌐 سایت (غیرفعال)", callback_data: "website" }],
    ],
  };
}

// کیبورد بخش آدرس
function addressKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🗺️ باز کردن در نشان", url: SHOP_INFO.neshanUrl },
        { text: "📍 باز کردن در گوگل مپ", url: SHOP_INFO.googleMapsUrl },
      ],
      [{ text: "🔙 بازگشت به منوی اصلی", callback_data: "back_main" }],
    ],
  };
}

// کیبورد شبکه‌های اجتماعی
function socialKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "📱 ایتا", url: SHOP_INFO.eitaa }],
      [{ text: "📱 روبیکا", url: SHOP_INFO.rubika }],
      [{ text: "📸 اینستاگرام", url: SHOP_INFO.instagram }],
      [{ text: "🔙 بازگشت به منوی اصلی", callback_data: "back_main" }],
    ],
  };
}

// کیبورد پشتیبانی (نمایش اطلاعات و لینک به اکانت پشتیبانی)
function supportKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "💬 ارسال پیام به پشتیبانی", url: `https://t.me/${SHOP_INFO.supportId.replace("@", "")}` }],
      [{ text: "🔙 بازگشت به منوی اصلی", callback_data: "back_main" }],
    ],
  };
}

// کیبورد لیست سوالات FAQ
function faqListKeyboard() {
  const buttons = FAQS.map((faq, index) => [
    { text: faq.q, callback_data: `faq_${index}` },
  ]);
  buttons.push([{ text: "🔙 بازگشت به منوی اصلی", callback_data: "back_main" }]);
  return { inline_keyboard: buttons };
}

// کیبورد بازگشت به لیست FAQ
function backToFaqKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🔙 بازگشت به سوالات", callback_data: "faq" }],
      [{ text: "🏠 منوی اصلی", callback_data: "back_main" }],
    ],
  };
}

// کیبورد برای پیام "بعداً فعال می‌شود"
function backToMainKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🔙 بازگشت به منوی اصلی", callback_data: "back_main" }],
    ],
  };
}

// ==================== هندلرهای اصلی ====================

// هندلر فرمان /start (نمایش منوی اصلی)
async function handleStart(chat_id, token) {
  const text = `🏪 به فروشگاه <b>شما شاپ</b> خوش آمدید!\n\nلطفاً از منوی زیر گزینه مورد نظر خود را انتخاب کنید:`;
  await sendMessage(token, chat_id, text, mainMenuKeyboard());
}

// هندلر callback query (دکمه‌های شیشه‌ای)
async function handleCallback(callback_query, token) {
  const { id, data, message } = callback_query;
  const chat_id = message.chat.id;
  const message_id = message.message_id;

  // پاسخ فوری برای بستن حالت بارگذاری
  await answerCallbackQuery(token, id);

  try {
    switch (data) {
      case "about":
        await editMessageText(
          token,
          chat_id,
          message_id,
          `🏪 <b>درباره ما</b>\n\n${SHOP_INFO.about}`,
          backToMainKeyboard()
        );
        break;

      case "address":
        await editMessageText(
          token,
          chat_id,
          message_id,
          `📍 <b>آدرس فروشگاه</b>\n\n${SHOP_INFO.address}\n\nبرای مسیریابی یکی از گزینه‌های زیر را انتخاب کنید:`,
          addressKeyboard()
        );
        break;

      case "social":
        await editMessageText(
          token,
          chat_id,
          message_id,
          `📢 <b>شبکه‌های اجتماعی شما شاپ</b>\n\nاز طریق لینک‌های زیر ما را دنبال کنید:`,
          socialKeyboard()
        );
        break;

      case "support":
        await editMessageText(
          token,
          chat_id,
          message_id,
          `☎️ <b>پشتیبانی و ثبت سفارش</b>\n\nبرای ارتباط مستقیم با پشتیبانی روی دکمه زیر کلیک کنید.\nآیدی: ${SHOP_INFO.supportId}`,
          supportKeyboard()
        );
        break;

      case "faq":
        await editMessageText(
          token,
          chat_id,
          message_id,
          "❓ <b>سوالات متداول</b>\n\nلطفاً سوال خود را انتخاب کنید:",
          faqListKeyboard()
        );
        break;

      case "website":
        // بعداً لینک سایت فعال شود
        await editMessageText(
          token,
          chat_id,
          message_id,
          "🌐 بخش سایت در حال حاضر غیرفعال است و به‌زودی فعال خواهد شد.",
          backToMainKeyboard()
        );
        break;

      case "back_main":
        await editMessageText(
          token,
          chat_id,
          message_id,
          "🏪 <b>منوی اصلی</b>\n\nلطفاً گزینه مورد نظر را انتخاب کنید:",
          mainMenuKeyboard()
        );
        break;

      default:
        // بررسی سوالات FAQ با فرمت faq_0, faq_1, ...
        if (data.startsWith("faq_")) {
          const index = parseInt(data.split("_")[1]);
          if (index >= 0 && index < FAQS.length) {
            const faq = FAQS[index];
            await editMessageText(
              token,
              chat_id,
              message_id,
              `❓ <b>${faq.q}</b>\n\n${faq.a}`,
              backToFaqKeyboard()
            );
          }
        } else {
          // داده ناشناخته
          await editMessageText(
            token,
            chat_id,
            message_id,
            "⚠️ گزینه نامعتبر. لطفاً به منوی اصلی بازگردید.",
            backToMainKeyboard()
          );
        }
    }
  } catch (error) {
    console.error("Error in callback:", error);
  }
}

// هندلر Inline Query (جستجوی درون خطی)
async function handleInlineQuery(inline_query, token) {
  const query = inline_query.query.trim();

  // فقط اگر کاربر دقیقاً "آدرس" را تایپ کند (یا می‌توانید شرط را تغییر دهید)
  if (query === "آدرس") {
    const result = {
      type: "article",
      id: "1",
      title: "📍 آدرس فروشگاه شما شاپ",
      description: "آدرس و مسیریابی فروشگاه",
      input_message_content: {
        message_text: `🏪 <b>فروشگاه شما شاپ</b>\n\n${SHOP_INFO.address}\n\nبرای مسیریابی از دکمه‌های زیر استفاده کنید:`,
        parse_mode: "HTML",
      },
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🗺️ باز کردن در نشان", url: SHOP_INFO.neshanUrl },
            { text: "📍 باز کردن در گوگل مپ", url: SHOP_INFO.googleMapsUrl },
          ],
          [{ text: "💬 پشتیبانی", url: `https://t.me/${SHOP_INFO.supportId.replace("@", "")}` }],
        ],
      },
    };

    await answerInlineQuery(token, inline_query.id, [result]);
  } else {
    // اگر کلمه دیگری تایپ شود، نتیجه خالی یا یک پیام راهنما
    await answerInlineQuery(token, inline_query.id, [], {
      switch_pm_text: "راهنمای ربات",
      switch_pm_parameter: "start",
    });
  }
}

// هندلر پیام‌های متنی ناشناخته
async function handleUnknownMessage(chat_id, token) {
  const text = "⚠️ دستور نامعتبر!\n\nلطفاً از منوی زیر استفاده کنید یا /start را بزنید.";
  await sendMessage(token, chat_id, text, mainMenuKeyboard());
}

// ==================== Webhook Handler ====================

async function handleUpdate(update, token) {
  if (update.message) {
    const message = update.message;
    if (message.text && message.text.startsWith("/start")) {
      await handleStart(message.chat.id, token);
    } else {
      await handleUnknownMessage(message.chat.id, token);
    }
  } else if (update.callback_query) {
    await handleCallback(update.callback_query, token);
  } else if (update.inline_query) {
    await handleInlineQuery(update.inline_query, token);
  }
}

// ==================== Worker Entry Point ====================

export default {
  async fetch(request, env, ctx) {
    // فقط درخواست‌های POST پردازش می‌شوند
    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    try {
      const update = await request.json();
      const token = env.BOT_TOKEN; // توکن از متغیر محیطی خوانده می‌شود

      await handleUpdate(update, token);
    } catch (error) {
      console.error("Worker Error:", error);
    }

    // همیشه پاسخ مثبت بدهیم تا تلگرام دوباره تلاش نکند
    return new Response("OK", { status: 200 });
  },
};