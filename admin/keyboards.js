export function adminMainKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '👥 تعداد کل کاربران', callback_data: 'admin_total_users' }],
      [{ text: '📅 کاربران امروز', callback_data: 'admin_today_users' }],
      [{ text: '📦 سفارشات امروز', callback_data: 'admin_today_orders' }],
      [{ text: '📣 ارسال پیام همگانی', callback_data: 'admin_broadcast' }],
      [{ text: '🚪 خروج از پنل مدیریت', callback_data: 'admin_exit' }]
    ]
  };
}

export function backToAdminKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🔙 بازگشت به منوی مدیریت', callback_data: 'admin_main' }]
    ]
  };
}