export function mainReplyKeyboard() {
  return {
    keyboard: [
      [{ text: '📦 دریافت لیست محصولات' }, { text: '☎️ راه‌های ارتباطی' }],
      [{ text: '📝 راهنمای ثبت سفارش' }],
      [{ text: '🏪 درباره ما' }, { text: '❓ سوالات متداول' }],
      [{ text: '🔙 بازگشت' }, { text: '🏠 منوی اصلی' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

export function productsKeyboard(CONFIG) {
  return {
    inline_keyboard: [
      [
        { text: '📱 ایتا', url: CONFIG.eitaaUrl },
        { text: '📱 روبیکا', url: CONFIG.rubikaUrl }
      ],
      [{ text: '📸 اینستاگرام', url: CONFIG.instagramUrl }]
    ]
  };
}

export function guideKeyboard(CONFIG) {
  return {
    inline_keyboard: [
      [
        { text: '📱 ایتا', url: CONFIG.eitaaUrl },
        { text: '📱 روبیکا', url: CONFIG.rubikaUrl }
      ],
      [
        { text: '☎️ راه‌های ارتباطی', callback_data: 'contact' }
      ]
    ]
  };
}

export function contactKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📍 آدرس فروشگاه', callback_data: 'address' }],
      [{ text: '📞 شماره تماس و پشتیبانی', callback_data: 'phone' }]
    ]
  };
}

export function addressKeyboard(CONFIG) {
  return {
    inline_keyboard: [
      [
        { text: '🗺 مسیریابی در نشان', url: CONFIG.neshanUrl },
        { text: '📍 مسیریابی در گوگل مپ', url: CONFIG.googleMapsUrl }
      ]
    ]
  };
}

export function faqListKeyboard(faq) {
  return {
    inline_keyboard: faq.map((item, idx) => [{
      text: item.q,
      callback_data: `faq:q:${idx}`
    }])
  };
}

export function faqDetailKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🔙 بازگشت به سوالات', callback_data: 'faq_list' }]
    ]
  };
}

export function faqContactKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🔙 بازگشت به سوالات', callback_data: 'faq_list' }]
    ]
  };
}