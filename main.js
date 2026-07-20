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
    
    // ✅ تبدیل ADMIN_ID به آرایه
    const adminIds = (env.ADMIN_ID || '').split(',').map(id => id.trim());

    try {
      if (update.message) {
        const userId = String(update.message.from.id);

        if (adminIds.includes(userId)) {
          await handleAdminMessage(update.message, token, env);
        } else {
          await handleMessage(update.message, token, env);
        }
      }
      else if (update.callback_query) {
        const userId = String(update.callback_query.from.id);

        if (adminIds.includes(userId)) {
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