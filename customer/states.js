import { texts } from './texts.js';
import { faq } from './faq.js';

import {
  mainReplyKeyboard,
  productsKeyboard,
  trustKeyboard,
  contactKeyboard,
  addressKeyboard,
  phoneKeyboard,
  faqListKeyboard,
  faqDetailKeyboard
} from './keyboards.js';

/*
 * هر state دقیقاً یک متن و یک کیبورد دارد که هم موقع ارسال پیام
 * جدید و هم موقع ویرایش پیام قبلی استفاده می‌شود.
 *
 * keyboardType:
 *   'reply'  → کیبورد ثابت پایین صفحه
 *   'inline' → دکمه‌های شیشه‌ای زیر پیام
 *
 * این تفاوت مهم است چون Telegram اجازه نمی‌دهد ReplyKeyboardMarkup
 * را از طریق editMessageText تنظیم کنیم.
 */

export function getStateView(state, config) {
  switch (state) {
    case 'main':
      return {
        text: texts.main(config),
        keyboard: mainReplyKeyboard(),
        keyboardType: 'reply'
      };

    case 'products':
      return {
        text: texts.products(),
        keyboard: productsKeyboard(config),
        keyboardType: 'inline'
      };

    case 'trust':
      return {
        text: texts.trust(config),
        keyboard: trustKeyboard(config),
        keyboardType: 'inline'
      };

    case 'contact':
      return {
        text: texts.contact(),
        keyboard: contactKeyboard(),
        keyboardType: 'inline'
      };

    case 'address':
      return {
        text: texts.address(config),
        keyboard: addressKeyboard(config),
        keyboardType: 'inline'
      };

    case 'phone':
      return {
        text: texts.phone(config),
        keyboard: phoneKeyboard(),
        keyboardType: 'inline'
      };

    case 'faq':
      return {
        text: texts.faq(),
        keyboard: faqListKeyboard(),
        keyboardType: 'inline'
      };

    default:
      return null;
  }
}

export function getFaqDetailView(index) {
  const item = faq[index];

  if (!item) {
    return null;
  }

  return {
    text: texts.faqDetail(item),
    keyboard: faqDetailKeyboard(),
    keyboardType: 'inline'
  };
}
