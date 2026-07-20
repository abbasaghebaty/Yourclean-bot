import { handleMessage, handleCallback } from './customer/bot.js';
import { handleAdminMessage, handleAdminCallback } from './admin/admin.js';
import { handleScheduled } from './admin/cron.js';

const DAILY_LIMIT = 150;

export default {
  async fetch(request, env) {
    // ... بقیه کد

    try {
      if (update.message) {
        if (adminIds.includes(userId)) {
          await handleAdminMessage(update.message, token, env);
        } else {
          await handleMessage(update.message, token, env);
        }
      } else if (update.callback_query) {
        if (adminIds.includes(userId)) {
          // ✅ ادمین‌ها به handleAdminCallback میرن
          await handleAdminCallback(update.callback_query, token, env);
        } else {
          // ✅ کاربران عادی به handleCallback میرن
          await handleCallback(update.callback_query, token);
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