import { texts } from './texts.js';

import {
  mainReplyKeyboard,
  productsKeyboard,
  trustKeyboard,
  guideKeyboard,
  contactKeyboard,
  addressKeyboard,
  phoneKeyboard,
  faqListKeyboard,
  faqDetailKeyboard
} from './keyboards.js';


/*
 * هر state دقیقاً یک متن و یک کیبورد دارد که هم موقع ارسال پیام
 * جدید و هم موقع ویرایش پیام قبلی استفاده می‌شود. این باعث می‌شود
 * متن و دکمه‌های یک صفحه هیچ‌وقت دو نسخهٔ مختلف نداشته باشند.
 *
 * keyboardType:
 *  - 'reply'  → کیبورد ثابت پایین صفحه (فقط state=main)
 *  - 'inline' → دکمه‌های شیشه‌ای زیر پیام
 *
 * این تفاوت مهم است چون تلگرام اجازه نمی‌دهد کیبورد ثابت را از
 * طریق ویرایش پیام (editMessageText) تنظیم کرد؛ کیبورد ثابت فقط
 * با ارسال پیام جدید (sendMessage) قابل نمایش است. bot.js از روی
 * همین فیلد تصمیم می‌گیرد کِی باید به‌جای ویرایش، پیام تازه بفرستد.
 */
export function getStateView(
  state,
  config
) {
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


    case 'guide':
      return {
        text: texts.guide(config),
        keyboard: guideKeyboard(),
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
        keyboard: faqListKeyboard(config),
        keyboardType: 'inline'
      };


    default:
      return null;
  }
}


export function getFaqDetailView(
  index,
  config
) {
  const item = config.faq[index];

  if (!item) {
    return null;
  }

  return {
    text: texts.faqDetail(item),
    keyboard: faqDetailKeyboard(),
    keyboardType: 'inline'
  };
}
