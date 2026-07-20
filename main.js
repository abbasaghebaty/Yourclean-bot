import { handleMessage, handleCallback } from './customer/bot.js';
import { handleAdminMessage, handleAdminCallback } from './admin/admin.js';
import { handleScheduled } from './admin/cron.js';

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
    const adminId = env.ADMIN_ID;

    try {
      // پیام‌های معمولی
      if (update.message) {
        const userId = update.message.from.id;

        if (String(userId) === String(adminId)) {
          await handleAdminMessage(update.message, token, env);
        } else {
          await handleMessage(update.message, token, env);
        }
      }
      // callback query ها
      else if (update.callback_query) {
        const userId = update.callback_query.from.id;

        if (String(userId) === String(adminId)) {
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