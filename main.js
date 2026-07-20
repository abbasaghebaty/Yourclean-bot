import { handleMessage, handleCallback } from './bot.js';

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

    try {
      if (update.message) {
        await handleMessage(update.message, token, env);
      } else if (update.callback_query) {
        await handleCallback(update.callback_query, token);
      }
    } catch (error) {
      console.error('Unhandled error:', error);
    }

    return new Response('OK');
  }
};