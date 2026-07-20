import { getTotalUsers, getTodayUsers, getTodayOrders } from './database.js';

export async function handleScheduled(env) {
  const token = env.BOT_TOKEN;
  const channelId = env.CHANNEL_ID;

  if (!channelId) {
    console.log('CHANNEL_ID not set');
    return;
  }

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
━━━━━━━━━━━━━━━━

🛍 <b>وضعیت فروشگاه:</b> فعال ✅`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: channelId,
      text: report,
      parse_mode: 'HTML'
    })
  });
}