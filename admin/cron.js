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

  const result = await callApi(token, 'sendMessage', {
    chat_id: channelId,
    text: report,
    parse_mode: 'HTML'
  });

  // ۵ ثانیه بعد پاک کن
  if (result.ok && result.result) {
    setTimeout(async () => {
      await callApi(token, 'deleteMessage', {
        chat_id: channelId,
        message_id: result.result.message_id
      });
    }, 5000);
  }
}