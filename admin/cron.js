import { getTotalUsers, getTodayUsers, getTodayOrders } from './database.js';

async function callApi(token, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await response.json();
}

export async function handleScheduled(env) {
  const token = env.BOT_TOKEN;
  const channelId = env.CHANNEL_ID || '-1003788455797';

  const totalUsers = await getTotalUsers(env);
  const todayUsers = await getTodayUsers(env);
  const todayOrders = await getTodayOrders(env);

  const now = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });

  const report = `📊 <b>گزارش روزانه شما شاپ</b>

📅 <b>تاریخ:</b> ${now}

━━━━━━━━━━━━━━━━
👥 <b>کل کاربران:</b> ${totalUsers} نفر
🆕 <b>کاربران امروز:</b> ${todayUsers} نفر
📦 <b>سفارشات امروز:</b> ${todayOrders} عدد
━━━━━━━━━━━━━━━━`;

  // ارسال گزارش
  await callApi(token, 'sendMessage', {
    chat_id: channelId,
    text: report,
    parse_mode: 'HTML'
  });

  // ارسال پیام دوم که ۵ ثانیه بعد پاک میشه
  const deleteMsg = await callApi(token, 'sendMessage', {
    chat_id: channelId,
    text: '⏳ این پیام به‌زودی حذف می‌شود...'
  });

  if (deleteMsg.ok && deleteMsg.result) {
    // ذخیره message_id توی KV برای پاک کردن در درخواست بعدی
    await env.RATE_LIMITER.put('pending_delete', JSON.stringify({
      chat_id: channelId,
      message_id: deleteMsg.result.message_id
    }), { expirationTtl: 10 });

    // یه وقفه کوتاه با Promise (بهتر از setTimeout)
    await new Promise(resolve => setTimeout(resolve, 5000));

    await callApi(token, 'deleteMessage', {
      chat_id: channelId,
      message_id: deleteMsg.result.message_id
    });
  }
}