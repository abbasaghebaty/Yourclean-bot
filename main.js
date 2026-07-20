import { handleMessage, handleCallback } from './customer/bot.js';
import { handleAdminMessage, handleAdminCallback } from './admin/admin.js';
import { handleScheduled } from './admin/cron.js';

// حداکثر درخواست روزانه برای هر کاربر عادی
const DAILY_LIMIT = 150;

export default {
  async fetch(request, env) {
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

    const adminIds = env.ADMIN_ID ? env.ADMIN_ID.split(',').map(id => parseInt(id.trim())) : [];
    const userId = update.message?.from?.id || update.callback_query?.from?.id;
    const today = new Date().toISOString().split('T')[0];

    // فقط برای کاربران عادی (غیر ادمین) محدودیت اعمال می‌شود
    if (!adminIds.includes(userId)) {
      const rateKey = `rate:${userId}:${today}`;
      const notifyKey = `notify:${userId}:${today}`;

      let count = await env.RATE_LIMITER.get(rateKey);
      count = count ? parseInt(count) : 0;

      const alreadyNotified = await env.RATE_LIMITER.get(notifyKey);

      if (count >= DAILY_LIMIT) {
        if (!alreadyNotified) {
          const userInfo = update.message?.from || update.callback_query?.from || {};
          const fullName = [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ') || 'نامشخص';
          const username = userInfo.username ? `@${userInfo.username}` : 'ندارد';

          for (const adminId of adminIds) {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: adminId,
                text: `🚨 کاربر به محدودیت روزانه رسید!\n\n🆔 User ID: <code>${userId}</code>\n👤 نام: ${fullName}\n👤 یوزرنیم: ${username}\n📊 تعداد درخواست: <b>${count}</b>\n📅 تاریخ: ${today}`,
                parse_mode: 'HTML'
              })
            });
          }

          await env.RATE_LIMITER.put(notifyKey, '1', { expirationTtl: 86400 });
        }

        if (update.callback_query) {
          await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: '⚠️ محدودیت روزانه شما به پایان رسید. لطفاً فردا دوباره تلاش کنید.',
              show_alert: true
            })
          });
        }
        return new Response('OK');
      }

      await env.RATE_LIMITER.put(rateKey, count + 1, { expirationTtl: 86400 });
    }

    try {
      if (update.message) {
        if (adminIds.includes(userId)) {
          await handleAdminMessage(update.message, token, env);
        } else {
          await handleMessage(update.message, token, env);
        }
      } else if (update.callback_query) {
        // ✅ همه کاربران (ادمین و عادی) از یک هندلر استفاده میکنن
        await handleCallback(update.callback_query, token);
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