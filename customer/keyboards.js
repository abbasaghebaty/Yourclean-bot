```js
import { BUTTON_STYLES } from './buttonStyles.js';

function isValidUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

/**
 * Main menu
 */
export function mainReplyKeyboard() {
  return {
    keyboard: [
      [
        {
          text: '📦 مشاهده محصولات',
          style: BUTTON_STYLES.success
        },
        {
          text: '🛡️ اعتماد و اعتبار',
          style: BUTTON_STYLES.primary
        }
      ],
      [
        {
          text: '☎️ راه‌های ارتباطی',
          style: BUTTON_STYLES.primary
        },
        {
          text: '❓ سوالات متداول',
          style: BUTTON_STYLES.primary
        }
      ]
    ],
    resize_keyboard: true,
    is_persistent: true
  };
}

/**
 * Product channels
 */
export function productsKeyboard(CONFIG) {
  const buttons = [];

  const channelButtons = [];

  if (isValidUrl(CONFIG.eitaaUrl)) {
    channelButtons.push({
      text: '📱 ایتا',
      url: CONFIG.eitaaUrl,
      style: BUTTON_STYLES.primary
    });
  }

  if (isValidUrl(CONFIG.rubikaUrl)) {
    channelButtons.push({
      text: '📱 روبیکا',
      url: CONFIG.rubikaUrl,
      style: BUTTON_STYLES.primary
    });
  }

  if (channelButtons.length) {
    buttons.push(channelButtons);
  }

  return {
    inline_keyboard: buttons
  };
}

/**
 * Trust / credibility
 */
export function trustKeyboard(CONFIG) {
  const buttons = [];

  if (isValidUrl(CONFIG.websiteUrl)) {
    buttons.push([
      {
        text: '🌐 وب‌سایت رسمی فروشگاه',
        url: CONFIG.websiteUrl,
        style: BUTTON_STYLES.primary
      }
    ]);
  }

  if (isValidUrl(CONFIG.enamadUrl)) {
    buttons.push([
      {
        text: '🛡️ نماد اعتماد الکترونیکی',
        url: CONFIG.enamadUrl,
        style: BUTTON_STYLES.primary
      }
    ]);
  }

  return {
    inline_keyboard: buttons
  };
}

/**
 * Guide
 */
export function guideKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '☎️ ارتباط با پشتیبانی',
          callback_data: 'contact',
          style: BUTTON_STYLES.primary
        }
      ],
      [
        {
          text: '🔙 بازگشت',
          callback_data: 'main',
          style: BUTTON_STYLES.danger
        }
      ]
    ]
  };
}

/**
 * Contact
 */
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
          text: '☎️ شماره تماس',
          callback_data: 'phone',
          style: BUTTON_STYLES.primary
        }
      ],
      [
        {
          text: '🔙 بازگشت',
          callback_data: 'main',
          style: BUTTON_STYLES.danger
        }
      ]
    ]
  };
}

/**
 * Address
 */
export function addressKeyboard(CONFIG) {
  const buttons = [];

  const navigationButtons = [];

  if (isValidUrl(CONFIG.neshanUrl)) {
    navigationButtons.push({
      text: '🗺️ نشان',
      url: CONFIG.neshanUrl,
      style: BUTTON_STYLES.primary
    });
  }

  if (isValidUrl(CONFIG.googleMapsUrl)) {
    navigationButtons.push({
      text: '📍 Google Maps',
      url: CONFIG.googleMapsUrl,
      style: BUTTON_STYLES.primary
    });
  }

  if (navigationButtons.length) {
    buttons.push(navigationButtons);
  }

  buttons.push([
    {
      text: '🔙 بازگشت',
      callback_data: 'contact',
      style: BUTTON_STYLES.danger
    }
  ]);

  return {
    inline_keyboard: buttons
  };
}

/**
 * Phone
 */
export function phoneKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '☎️ تماس با فروشگاه',
          callback_data: 'contact_phone',
          style: BUTTON_STYLES.primary
        }
      ],
      [
        {
          text: '🔙 بازگشت',
          callback_data: 'contact',
          style: BUTTON_STYLES.danger
        }
      ]
    ]
  };
}

/**
 * FAQ list
 */
export function faqListKeyboard(CONFIG) {
  const buttons = [];

  for (let i = 0; i < CONFIG.faq.length; i++) {
    buttons.push([
      {
        text: CONFIG.faq[i].q,
        callback_data: `faq_${i}`,
        style: BUTTON_STYLES.primary
      }
    ]);
  }

  buttons.push([
    {
      text: '🔙 بازگشت',
      callback_data: 'main',
      style: BUTTON_STYLES.danger
    }
  ]);

  return {
    inline_keyboard: buttons
  };
}

/**
 * FAQ detail
 */
export function faqDetailKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '☎️ ارتباط با پشتیبانی',
          callback_data: 'contact',
          style: BUTTON_STYLES.primary
        }
      ],
      [
        {
          text: '🔙 بازگشت به سوالات',
          callback_data: 'faq',
          style: BUTTON_STYLES.danger
        }
      ]
    ]
  };
}

/**
 * FAQ contact
 */
export function faqContactKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '🔙 بازگشت',
          callback_data: 'faq',
          style: BUTTON_STYLES.danger
        }
      ]
    ]
  };
}
```
