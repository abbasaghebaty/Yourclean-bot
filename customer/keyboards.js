
function isValidUrl(url) {
  return (
    typeof url === 'string' &&
    /^https?:\/\//i.test(url)
  );
}


export function mainReplyKeyboard() {
  return {
    keyboard: [
      [
        {
          text: '📦 مشاهده محصولات',
          style: 'success'
        },
        {
          text: '🛡️ اعتماد و اعتبار',
          style: 'primary'
        }
      ],
      [
        {
          text: '☎️ راه‌های ارتباطی',
          style: 'primary'
        },
        {
          text: '❓ سوالات متداول',
          style: 'primary'
        }
      ]
    ],

    resize_keyboard: true,
    is_persistent: true
  };
}


export function productsKeyboard(config) {
  const row = [];

  if (isValidUrl(config.eitaaUrl)) {
    row.push({
      text: '📱 ایتا',
      url: config.eitaaUrl,
      style: 'primary'
    });
  }

  if (isValidUrl(config.rubikaUrl)) {
    row.push({
      text: '📱 روبیکا',
      url: config.rubikaUrl,
      style: 'primary'
    });
  }

  return {
    inline_keyboard:
      row.length
        ? [row]
        : []
  };
}


export function trustKeyboard(config) {
  const buttons = [];

  if (isValidUrl(config.websiteUrl)) {
    buttons.push([
      {
        text: '🌐 وب‌سایت رسمی فروشگاه',
        url: config.websiteUrl,
        style: 'primary'
      }
    ]);
  }

  if (isValidUrl(config.enamadUrl)) {
    buttons.push([
      {
        text: '🛡️ نماد اعتماد الکترونیکی',
        url: config.enamadUrl,
        style: 'primary'
      }
    ]);
  }

  return {
    inline_keyboard: buttons
  };
}


export function guideKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '☎️ ارتباط با پشتیبانی',
          callback_data: 'contact',
          style: 'primary'
        }
      ],
      [
        {
          text: '🔙',
          callback_data: 'main',
          style: 'danger'
        }
      ]
    ]
  };
}


export function contactKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '📍 آدرس فروشگاه',
          callback_data: 'address',
          style: 'primary'
        }
      ],
      [
        {
          text: '☎️ شماره تماس',
          callback_data: 'phone',
          style: 'primary'
        }
      ]
    ]
  };
}


export function addressKeyboard(config) {
  const navigationRow = [];

  if (isValidUrl(config.neshanUrl)) {
    navigationRow.push({
      text: '🗺️ نشان',
      url: config.neshanUrl,
      style: 'primary'
    });
  }

  if (isValidUrl(config.googleMapsUrl)) {
    navigationRow.push({
      text: '📍 Google Maps',
      url: config.googleMapsUrl,
      style: 'primary'
    });
  }

  const rows = [];

  if (navigationRow.length) {
    rows.push(navigationRow);
  }

  rows.push([
    {
      text: '🔙',
      callback_data: 'contact',
      style: 'danger'
    }
  ]);

  return {
    inline_keyboard: rows
  };
}


export function phoneKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '🔙',
          callback_data: 'contact',
          style: 'danger'
        }
      ]
    ]
  };
}


export function faqListKeyboard(config) {
  const buttons =
    config.faq.map(
      (item, index) => [
        {
          text: item.q,
          callback_data:
            `faq_${index}`,
          style: 'primary'
        }
      ]
    );

  return {
    inline_keyboard: buttons
  };
}


export function faqDetailKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '☎️ ارتباط با پشتیبانی',
          callback_data: 'contact',
          style: 'primary'
        }
      ],
      [
        {
          text: '🔙 به سوالات',
          callback_data: 'faq',
          style: 'danger'
        }
      ]
    ]
  };
}
