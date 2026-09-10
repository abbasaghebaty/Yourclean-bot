import { handleMessage, handleCallback } from './customer/bot.js';
import { getToken, callApi } from './customer/telegram.js';
import { texts } from './customer/texts.js';

const DAILY_LIMIT = 150;

export default {
  async fetch(request, env) {
    if (request.method === 'GET') {
      return new Response('YourClean bot is running.', {
        status: 200
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405
      });
    }

    const token = getToken(env);

    if (!token) {
      console.error(
        'BOT_TOKEN / TELEGRAM_BOT_TOKEN is not configured.'
      );

      return new Response(
        'Bot token is not configured.',
        { status: 500 }
      );
    }

    let update;

    try {
      update = await request.json();
    } catch (error) {
      console.error('Invalid Telegram update:', error);

      return new Response(
        'Invalid JSON',
        { status: 400 }
      );
    }

    const userId =
      update.message?.from?.id ??
      update.callback_query?.from?.id;

    const isMessage = Boolean(update.message);

    if (!userId) {
      return new Response('OK', {
        status: 200
      });
    }

    /*
     * فقط پیام واقعی کاربر
     * callbackها محدودیت روزانه را مصرف نمی‌کنند.
     */
    if (isMessage) {
      const today = new Date()
        .toISOString()
        .slice(0, 10);

      const rateKey =
        `rate:${userId}:${today}`;

      try {
        const raw =
          await env.RATE_LIMITER.get(rateKey);

        const count =
          raw
            ? Number.parseInt(raw, 10)
            : 0;

        if (count >= DAILY_LIMIT) {
          try {
            await callApi(
              token,
              'sendMessage',
              {
                chat_id:
                  update.message.chat.id,

                text:
                  texts.rateLimited(DAILY_LIMIT)
              }
            );
          } catch (error) {
            console.error(
              'Failed to send rate-limit message:',
              error
            );
          }

          return new Response(
            'Rate limited',
            { status: 200 }
          );
        }

        await env.RATE_LIMITER.put(
          rateKey,
          String(count + 1),
          {
            expirationTtl: 86400
          }
        );
      } catch (error) {
        /*
         * خرابی KV نباید کل ربات را از کار بیندازد.
         */
        console.error(
          'Rate limiter error:',
          error
        );
      }
    }

    try {
      if (update.message) {
        await handleMessage(
          env,
          update
        );
      } else if (update.callback_query) {
        await handleCallback(
          env,
          update
        );
      }
    } catch (error) {
      console.error(
        'Unhandled bot error:',
        error
      );
    }

    return new Response('OK', {
      status: 200
    });
  }
};
