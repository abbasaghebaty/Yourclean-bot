import { handleMessage, handleCallback } from './customer/bot.js';
import { handleAdminMessage, handleAdminCallback } from './admin/admin.js';
import { handleScheduled } from './admin/cron.js';

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

    const ADMIN_ID = env.ADMIN_ID ? parseInt(env.ADMIN_ID) : null;

    try {
      if (update.message) {
        const userId = update.message.from.id;
        if (ADMIN_ID && userId === ADMIN_ID) {
          await handleAdminMessage(update.message, token, env);
        } else {
          await handleMessage(update.message, token, env);
        }
      } else if (update.callback_query) {
        const userId = update.callback_query.from.id;
        if (ADMIN_ID && userId === ADMIN_ID) {
          await handleAdminCallback(update.callback_query, token, env);
        } else {
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