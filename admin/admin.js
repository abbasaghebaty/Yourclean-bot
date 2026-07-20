// ==============================================
// 📂 admin/admin.js - پنل مدیریت
// ==============================================

export async function handleAdminMessage(message, token, env) {
  const chatId = message.chat.id;
  const text = message.text || '';

  if (text === '/start') {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🛡️ پنل مدیریت\n\nبه پنل مدیریت خوش آمدید.',
        reply_markup: adminMenuKeyboard()
      })
    });
  } else {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `📩 پیام شما دریافت شد:\n\n${text}`
      })
    });
  }
}

export async function handleAdminCallback(callbackQuery, token, env) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  // پاسخ به تلگرام که دکمه دریافت شد
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id
    })
  });

  try {
    // ==========================================
    // دکمه‌های پنل مدیریت
    // ==========================================
    if (data === 'admin_users') {
      // دریافت لیست کاربران از دیتابیس
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

      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: text,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 بازگشت به منو', callback_data: 'admin_back' }]
            ]
          }
        })
      });
    } 
    else if (data === 'admin_stats') {
      // دریافت آمار از دیتابیس
      let totalUsers = 0;
      try {
        const result = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
        totalUsers = result?.count || 0;
      } catch (e) {
        console.error('DB error:', e);
      }

      const text = `📊 **آمار ربات:**\n\n👥 تعداد کل کاربران: **${totalUsers}**\n📅 تاریخ: ${new Date().toLocaleDateString('fa-IR')}`;

      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: text,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 بازگشت به منو', callback_data: 'admin_back' }]
            ]
          }
        })
      });
    } 
    else if (data === 'admin_broadcast') {
      // ارسال همگانی - مرحله ۱: دریافت پیام
      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: '📢 **ارسال پیام همگانی**\n\nلطفاً پیام مورد نظر خود را ارسال کنید.\n\n⚠️ این پیام برای **همه کاربران** ارسال خواهد شد.',
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 انصراف', callback_data: 'admin_back' }]
            ]
          }
        })
      });
    } 
    else if (data === 'admin_back') {
      // برگشت به منوی اصلی ادمین
      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: '🛡️ **پنل مدیریت**\n\nبه پنل مدیریت خوش آمدید.\nلطفاً یکی از گزینه‌های زیر را انتخاب کنید.',
          parse_mode: 'Markdown',
          reply_markup: adminMenuKeyboard()
        })
      });
    }
  } catch (error) {
    console.error('Admin callback error:', error);
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '⚠️ خطایی رخ داد. لطفاً دوباره تلاش کنید.'
      })
    });
  }
}

// ==============================================
// کیبورد منوی مدیریت
// ==============================================
function adminMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '👥 لیست کاربران', callback_data: 'admin_users' }],
      [{ text: '📊 آمار ربات', callback_data: 'admin_stats' }],
      [{ text: '📢 ارسال همگانی', callback_data: 'admin_broadcast' }],
      [{ text: '🏠 منوی اصلی', callback_data: 'main_menu' }]
    ]
  };
}