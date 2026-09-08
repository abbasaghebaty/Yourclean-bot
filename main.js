import { handleMessage, handleCallback } from './customer/bot.js';

const DAILY_LIMIT = 150;

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('OK');
    }

    let update;

    try {
      update = await request.json();
    } catch (error) {
      return new Response('Invalid JSON', { status: 400 });
    }

    const token = env.BOT_TOKEN;

    let userId = null;

    if (update.message) {
      userId = String(update.message.from.id);
    } else if (update.callback_query) {
      userId = String(update.callback_query.from.id);
    }

    if (!userId) {
      return new Response('No user ID', { status: 400 });
    }

    // محدودیت روزانه ضداسپم
    const today = new Date().toISOString().split('T')[0];
    const rateKey = `rate:${userId}:${today}`;

    let count = 0;

    try {
      const raw = await env.RATE_LIMITER.get(rateKey);
      count = raw ? parseInt(raw, 10) : 0;
    } catch (error) {
      console.error('Rate limiter read error:', error);
    }

    if (count >= DAILY_LIMIT) {
      if (update.message) {
        await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: update.message.chat.id,
              text:
                `محدودیت روزانه\n\n` +
                `شما تنها ${DAILY_LIMIT} پیام در روز می‌توانید ارسال کنید.\n` +
                `لطفاً فردا دوباره تلاش کنید.`
            })
          }
        );
      } else if (update.callback_query) {
        await fetch(
          `https://api.telegram.org/bot${token}/answerCallbackQuery`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: `محدودیت روزانه (${DAILY_LIMIT} پیام) تمام شد.`,
              show_alert: true
            })
          }
        );
      }

      return new Response('Rate limited', { status: 429 });
    }

    await env.RATE_LIMITER.put(
      rateKey,
      String(count + 1),
      {
        expirationTtl: 86400
      }
    );

    try {
      if (update.message) {
        await handleMessage(
          update.message,
          token,
          env
        );
      } else if (update.callback_query) {
        await handleCallback(
          update.callback_query,
          token,
          env
        );
      }
    } catch (error) {
      console.error('Unhandled error:', error);
    }

    return new Response('OK');
  }
};
