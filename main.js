import { handleMessage, handleCallback } from './customer/bot.js';
import { handleAdminMessage, handleAdminCallback } from './admin/admin.js';
import { handleScheduled } from './admin/cron.js';

const DAILY_LIMIT = 150;

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('OK');
    }

    let update;
    try {
      update = await request.json();
    } catch (e) {
      return new Response('Invalid JSON', { status: 400 });
    }

    const token = env.BOT_TOKEN;
    const adminIds = (env.ADMIN_ID || '').split(',').map(id => id.trim());

    // ==========================================
    // 🚦 تشخیص userId
    // ==========================================
    let userId = null;
    if (update.message) {
      userId = String(update.message.from.id);
    } else if (update.callback_query) {
      userId = String(update.callback_query.from.id);
    }

    if (!userId) {
      return new Response('No user ID', { status: 400 });
    }

    // ==========================================
    // 🛡️ ادمین‌ها محدودیت ندارن
    // ==========================================
    const isAdmin = adminIds.includes(userId);

    if (!isAdmin) {
      // ==========================================
      // 📊 چک کردن محدودیت روزانه کاربر
      // ==========================================
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const rateKey = `rate:${userId}:${today}`;
      
      let count = 0;
      try {
        const raw = await env.RATE_LIMITER.get(rateKey);
        count = raw ? parseInt(raw, 10) : 0;
      } catch (e) {}

      if (count >= DAILY_LIMIT) {
        // کاربر به سقف رسیده
        if (update.message) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: update.message.chat.id,
              text: `⚠️ محدودیت روزانه\n\nشما تنها ${DAILY_LIMIT} پیام در روز می‌توانید ارسال کنید.\nلطفاً فردا دوباره تلاش کنید.`
            })
          });
        } else if (update.callback_query) {
          await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: `⚠️ محدودیت روزانه (${DAILY_LIMIT} پیام) تمام شد. فردا دوباره بیا!`,
              show_alert: true
            })
          });
        }
        return new Response('Rate limited', { status: 429 });
      }

      // ==========================================
      // ✅ افزایش شمارنده
      // ==========================================
      await env.RATE_LIMITER.put(rateKey, String(count + 1), {
        expirationTtl: 86400 // ۲۴ ساعت
      });
    }

    // ==========================================
    // 🚀 ادامه پردازش عادی
    // ==========================================
    try {
      if (update.message) {
        if (isAdmin) {
          await handleAdminMessage(update.message, token, env);
        } else {
          await handleMessage(update.message, token, env);
        }
      } else if (update.callback_query) {
        if (isAdmin) {
          await handleAdminCallback(update.callback_query, token, env);
        } else {
          await handleCallback(update.callback_query, token, env);
        }
      }
    } catch (error) {
      console.error('Unhandled error:', error);
    }

    return new Response('OK');
  },

  async scheduled(event, env) {
    await handleScheduled(env);
  }
};