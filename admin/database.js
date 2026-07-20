import { ensureUsersSchema } from '../customer/database.js';

export async function getTotalUsers(env) {
  await ensureUsersSchema(env);
  const result = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
  return result.count;
}

export async function getTodayUsers(env) {
  await ensureUsersSchema(env);
  try {
    const result = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE('now')"
    ).first();
    return result.count;
  } catch (error) {
    console.error('Error in getTodayUsers:', error);
    return 0;
  }
}

export async function getTodayOrders(env) {
  // جدول orders هنوز ساخته نشده، در صورت عدم وجود 0 برگردان
  try {
    const result = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now')"
    ).first();
    return result.count;
  } catch (error) {
    return 0;
  }
}

export async function broadcastMessage(env, token, message) {
  const { results } = await env.DB.prepare('SELECT telegram_id FROM users').all();
  let success = 0;
  let fail = 0;

  for (const user of results) {
    try {
      await callTelegramApi(token, 'sendMessage', {
        chat_id: user.telegram_id,
        text: message
      });
      success++;
      // تأخیر کوچک برای رعایت محدودیت نرخ
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      fail++;
      console.error(`Failed to send to ${user.telegram_id}:`, error.description || error);
    }
  }
  return { success, fail };
}

// یک helper برای فراخوانی API تلگرام (جهت استفاده در broadcast)
async function callTelegramApi(token, method, body) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!data.ok) {
    console.error(`Telegram API error (${method}):`, data.description);
  }
  return data;
}