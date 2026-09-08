import { BUTTON_STYLES } from './buttonStyles.js';

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
text: '📝 راهنمای ثبت سفارش',
style: BUTTON_STYLES.primary
}
],
[
{
text: '🏪 درباره ما',
style: BUTTON_STYLES.primary
},
{
text: '❓ سوالات متداول',
style: BUTTON_STYLES.primary
}
],
[
{
text: '🔙 بازگشت',
style: BUTTON_STYLES.danger
},
{
text: '🏠 منوی اصلی',
style: BUTTON_STYLES.primary
}
]
],
resize_keyboard: true,
one_time_keyboard: false
};
}

export function productsKeyboard(CONFIG) {
return {
inline_keyboard: [
[
{
text: '📱 ایتا',
url: CONFIG.eitaaUrl,
style: BUTTON_STYLES.success
},
{
text: '📱 روبیکا',
url: CONFIG.rubikaUrl,
style: BUTTON_STYLES.success
}
],
[
{
text: '📸 اینستاگرام',
url: CONFIG.instagramUrl,
style: BUTTON_STYLES.success
}
]
]
};
}

export function guideKeyboard(CONFIG) {
return {
inline_keyboard: [
[
{
text: '📱 ایتا',
url: CONFIG.eitaaUrl,
style: BUTTON_STYLES.success
},
{
text: '📱 روبیکا',
url: CONFIG.rubikaUrl,
style: BUTTON_STYLES.success
}
],
[
{
text: '☎️ راه‌های ارتباطی',
callback_data: 'contact',
style: BUTTON_STYLES.primary
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
style: BUTTON_STYLES.primary
}
],
[
{
text: '📞 شماره تماس و پشتیبانی',
callback_data: 'phone',
style: BUTTON_STYLES.success
}
]
]
};
}

export function addressKeyboard(CONFIG) {
return {
inline_keyboard: [
[
{
text: '🗺 مسیریابی در نشان',
url: CONFIG.neshanUrl,
style: BUTTON_STYLES.success
},
{
text: '📍 مسیریابی در گوگل مپ',
url: CONFIG.googleMapsUrl,
style: BUTTON_STYLES.success
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
style: BUTTON_STYLES.primary
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
style: BUTTON_STYLES.primary
}
]
]
};
}
