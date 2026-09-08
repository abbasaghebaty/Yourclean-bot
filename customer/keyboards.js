import { BUTTON_STYLES } from './buttonStyles.js';

function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

export function mainReplyKeyboard() {
  return {
    keyboard: [
      [
        {
          text: '📦 دریافت لیست محصولات',
          style: BUTTON_STYLES.success
        },
        {
          text: '☎️ راه‌های ارتباطی',
          style: BUTTON_STYLES.primary
        }
      ],
      [
        {
          text: '❓ سوالات متداول',
          style: BUTTON_STYLES.primary
        }
      ]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

export function productsKeyboard(CONFIG) {
  const buttons = [];

  const socialButtons = [];

  if (isValidUrl(CONFIG.eitaaUrl)) {
    socialButtons.push({
      text: '📱 ایتا',
      url: CONFIG.eitaaUrl,
      style: BUTTON_STYLES.success
    });
  }

  if (isValidUrl(CONFIG.rubikaUrl)) {
    socialButtons.push({
      text: '📱 روبیکا',
      url: CONFIG.rubikaUrl,
      style: BUTTON_STYLES.success
    });
  }

  if (socialButtons.length > 0) {
    buttons.push(socialButtons);
  }

  if (isValidUrl(CONFIG.instagramUrl)) {
    buttons.push([
      {
        text: '📸 اینستاگرام',
        url: CONFIG.instagramUrl,
        style: BUTTON_STYLES.success
      }
    ]);
  }

  return {
    inline_keyboard: buttons
  };
}

export function guideKeyboard(CONFIG) {
  const keyboard = [];

  const socialButtons = [];

  if (isValidUrl(CONFIG.eitaaUrl)) {
    socialButtons.push({
      text: '📱 ایتا',
      url: CONFIG.eitaaUrl,
      style: BUTTON_STYLES.success
    });
  }

  if (isValidUrl(CONFIG.rubikaUrl)) {
    socialButtons.push({
      text: '📱 روبیکا',
      url: CONFIG.rubikaUrl,
      style: BUTTON_STYLES.success
    });
  }

  if (socialButtons.length > 0) {
    keyboard.push(socialButtons);
  }

  keyboard.push([
    {
      text: '☎️ راه‌های ارتباطی',
      callback_data: 'contact',
      style: BUTTON_STYLES.primary
    }
  ]);

  return {
    inline_keyboard: keyboard
  };
}

export function contactKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '📍 آدرس فروشگاه',
          callback_data: 'address',
          style: BUTTON_STYLES.primary
        }
      ],
      [
        {
          text: '📞 شماره تماس و پشتیبانی',
          callback_data: 'phone',
          style: BUTTON_STYLES.primary
        }
      ]
    ]
  };
}

export function addressKeyboard(CONFIG) {
  const keyboard = [];

  const navigationButtons = [];

  if (isValidUrl(CONFIG.neshanUrl)) {
    navigationButtons.push({
      text: '🗺 مسیریابی در نشان',
      url: CONFIG.neshanUrl,
      style: BUTTON_STYLES.primary
    });
  }

  if (isValidUrl(CONFIG.googleMapsUrl)) {
    navigationButtons.push({
      text: '📍 مسیریابی در گوگل مپ',
      url: CONFIG.googleMapsUrl,
      style: BUTTON_STYLES.primary
    });
  }

  if (navigationButtons.length > 0) {
    keyboard.push(navigationButtons);
  }

  keyboard.push([
    {
      text: '🔙 بازگشت به راه‌های ارتباطی',
      callback_data: 'contact',
      style: BUTTON_STYLES.danger
    }
  ]);

  return {
    inline_keyboard: keyboard
  };
}

export function phoneKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '🔙 بازگشت به راه‌های ارتباطی',
          callback_data: 'contact',
          style: BUTTON_STYLES.danger
        }
      ]
    ]
  };
}

export function faqListKeyboard(faq) {
  return {
    inline_keyboard: faq.map((item, idx) => [
      {
        text: item.q,
        callback_data: `faq:q:${idx}`,
        style: BUTTON_STYLES.primary
      }
    ])
  };
}

export function faqDetailKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '🔙 بازگشت به سوالات',
          callback_data: 'faq_list',
          style: BUTTON_STYLES.danger
        }
      ]
    ]
  };
}

export function faqContactKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '🔙 بازگشت به سوالات',
          callback_data: 'faq_list',
          style: BUTTON_STYLES.danger
        }
      ]
    ]
  };
}
