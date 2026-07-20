import { getTotalUsers } from './database.js';

// ==============================================
// 📞 صدا زدن API تلگرام
// ==============================================
async function callApi(token, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await response.json();
}

// ==============================================
// 🎛️ کیبورد منوی مدیریت
// ==============================================
function adminMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '👥 لیست کاربران', callback_data: 'admin_users' }],
      [{ text: '📊 آمار ربات', callback_data: 'admin_stats' }],
      [{ text: '📢 ارسال همگانی', callback_data: 'admin_broadcast' }],
      [{ text: '🔙 بازگشت به منوی کاربری', callback_data: 'back_to_user_menu' }]
    ]
  };
}

// ==============================================
// 📩 هندلر پیام‌های ادمین
// ==============================================
export async function handleAdminMessage(message, token, env) {
  const chatId = message.chat.id;
  const text = message.text || '';

  // ==========================================
  // چک کردن حالت انتظار broadcast
  // ==========================================
  try {
    const pendingAction = await env.RATE_LIMITER.get(`action:${chatId}`);
    if (pendingAction === 'broadcast') {
      await env.RATE_LIMITER.delete(`action:${chatId}`);

      // شروع ارسال همگانی
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: '⏳ در حال ارسال پیام همگانی...'
      });

      try {
        const { results } = await env.DB.prepare('SELECT telegram_id FROM users').all();
        let success = 0;
        let fail = 0;

        for (const user of results) {
          try {
            await callApi(token, 'sendMessage', {
              chat_id: user.telegram_id,
              text: text
            });
            success++;
          } catch (e) {
            fail++;
          }
          // تأخیر برای جلوگیری از محدودیت نرخ
          await new Promise(r => setTimeout(r, 50));
        }

        await callApi(token, 'sendMessage', {
          chat_id: chatId,
          text: `✅ ارسال همگانی به پایان رسید.\n\n📨 موفق: ${success}\n❌ ناموفق: ${fail}`,
          reply_markup: adminMenuKeyboard()
        });
      } catch (error) {
        await callApi(token, 'sendMessage', {
          chat_id: chatId,
          text: '⚠️ خطا در ارسال همگانی.',
          reply_markup: adminMenuKeyboard()
        });
      }
      return;
    }
  } catch (e) {}

  // ==========================================
  // دکمه‌های معمولی
  // ==========================================
  if (text === '/start' || text === '🛡️ پنل مدیریت' || text === '🔙 بازگشت به پنل مدیریت') {
    await callApi(token, 'sendMessage', {
      chat_id: chatId,
      text: '🛡️ **پنل مدیریت**\n\nبه پنل مدیریت خوش آمدید.\nلطفاً یکی از گزینه‌های زیر را انتخاب کنید.',
      parse_mode: 'Markdown',
      reply_markup: adminMenuKeyboard()
    });
  } else {
    await callApi(token, 'sendMessage', {
      chat_id: chatId,
      text: `📩 پیام شما دریافت شد:\n\n${text}`
    });
  }
}

// ==============================================
// 🔘 هندلر دکمه‌های شیشه‌ای ادمین
// ==============================================
export async function handleAdminCallback(callbackQuery, token, env) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  // پاسخ به تلگرام که دکمه دریافت شد
  await callApi(token, 'answerCallbackQuery', {
    callback_query_id: callbackQuery.id
  });

  try {
    // ==========================================
    // 📊 آمار ربات
    // ==========================================
    if (data === 'admin_stats') {
      const totalUsers = await getTotalUsers(env);

      const text = `📊 **آمار ربات:**\n\n👥 تعداد کل کاربران: **${totalUsers}**\n📅 تاریخ: ${new Date().toLocaleDateString('fa-IR')}`;

      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 بازگشت به منو', callback_data: 'admin_back' }]
          ]
        }
      });
    }

    // ==========================================
    // 👥 لیست کاربران
    // ==========================================
    else if (data === 'admin_users') {
      let users = [];
      try {
        const result = await env.DB.prepare(
          'SELECT telegram_id, username, first_name, created_at FROM users ORDER BY created_at DESC LIMIT 20'
        ).all();
        users = result.results || [];
      } catch (e) {
        console.error('DB error:', e);
      }

      let text = '👥 **لیست کاربران (۲۰ نفر آخر):**\n\n';
      if (users.length === 0) {
        text += 'هیچ کاربری یافت نشد.';
      } else {
        users.forEach((user, index) => {
          text += `${index + 1}. ID: \`${user.telegram_id}\``;
          if (user.username) text += ` | @${user.username}`;
          if (user.first_name) text += ` | ${user.first_name}`;
          text += `\n   📅 ${user.created_at || 'نامشخص'}\n\n`;
        });
      }

      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 بازگشت به منو', callback_data: 'admin_back' }]
          ]
        }
      });
    }

    // ==========================================
    // 📢 ارسال همگانی - حالت انتظار
    // ==========================================
    else if (data === 'admin_broadcast') {
      // ذخیره حالت انتظار توی KV
      await env.RATE_LIMITER.put(`action:${chatId}`, 'broadcast', { expirationTtl: 300 });

      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: '📢 **ارسال پیام همگانی**\n\nلطفاً پیام مورد نظر خود را ارسال کنید.\n\n⚠️ این پیام برای **همه کاربران** ارسال خواهد شد.\n\nبرای انصراف /start را بزنید.',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 انصراف', callback_data: 'admin_back' }]
          ]
        }
      });
    }

    // ==========================================
    // 🔙 بازگشت به منوی مدیریت
    // ==========================================
    else if (data === 'admin_back') {
      // پاک کردن هر حالت انتظار
      try { await env.RATE_LIMITER.delete(`action:${chatId}`); } catch (e) {}

      await callApi(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: '🛡️ **پنل مدیریت**\n\nبه پنل مدیریت خوش آمدید.\nلطفاً یکی از گزینه‌های زیر را انتخاب کنید.',
        parse_mode: 'Markdown',
        reply_markup: adminMenuKeyboard()
      });
    }

    // ==========================================
    // 🔙 بازگشت به منوی کاربری
    // ==========================================
    else if (data === 'back_to_user_menu') {
      // حذف پیام پنل مدیریت
      await callApi(token, 'deleteMessage', {
        chat_id: chatId,
        message_id: messageId
      });

      // ارسال منوی کاربری
      await callApi(token, 'sendMessage', {
        chat_id: chatId,
        text: '🏪 به فروشگاه خوش آمدید',
        reply_markup: {
          keyboard: [
            [{ text: '📦 دریافت لیست محصولات' }, { text: '☎️ راه‌های ارتباطی' }],
            [{ text: '📝 راهنمای ثبت سفارش' }],
            [{ text: '🏪 درباره ما' }, { text: '❓ سوالات متداول' }],
            [{ text: '🛡️ پنل مدیریت' }, { text: '🏠 منوی اصلی' }]
          ],
          resize_keyboard: true
        }
      });
    }
  } catch (error) {
    console.error('Admin callback error:', error);
    await callApi(token, 'sendMessage', {
      chat_id: chatId,
      text: '⚠️ خطایی رخ داد. لطفاً دوباره تلاش کنید.'
    });
  }
}