import { handleMessage, handleCallback } from './customer/bot.js';
import { handleAdminMessage, handleAdminCallback } from './admin/admin.js';

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

    // فقط برای تست - این دو خط رو اضافه کن
    console.log('ADMIN_ID from env:', ADMIN_ID);
    console.log('User ID:', update.message?.from?.id || update.callback_query?.from?.id);

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
  }
};