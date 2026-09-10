import { CONFIG } from './config.js';
import { faq } from './faq.js';
import { getToken, callApi } from './telegram.js';
import { setState, clearState } from './session.js';
import {
getStateView,
getFaqDetailView
} from './states.js';
import { saveUserToDB } from './database.js';

/*

* پیام جدید ارسال می‌کند.
* برای واکنش به دکمه‌های کیبورد ثابت (reply keyboard) و /start.
  */
  async function sendState(
  env,
  token,
  chatId,
  userId,
  state
  ) {
  const view =
  getStateView(
  state,
  CONFIG
  );

if (!view) {
await sendState(
env,
token,
chatId,
userId,
'main'
);

```
return;
```

}

await setState(
env,
userId,
state
);

await callApi(
token,
'sendMessage',
{
chat_id:
chatId,

```
  text:
    view.text,

  parse_mode:
    'HTML',

  reply_markup:
    view.keyboard
}
```

);
}

/*

* پیام موجود را ویرایش می‌کند (واکنش به دکمه‌های شیشه‌ای/inline).
*
* اگر state هدف از نوع 'reply' باشد، نمی‌توان ReplyKeyboardMarkup
* را با editMessageText روی پیام اعمال کرد.
*
* در این حالت ابتدا دکمه‌های inline پیام قبلی پاک می‌شوند و سپس
* منوی اصلی به‌صورت یک پیام تازه همراه با کیبورد ثابت ارسال می‌شود.
  */
  async function editState(
  env,
  token,
  chatId,
  messageId,
  userId,
  state
  ) {
  const view =
  getStateView(
  state,
  CONFIG
  );

if (!view) {
return;
}

await setState(
env,
userId,
state
);

if (
view.keyboardType === 'reply'
) {
try {
await callApi(
token,
'editMessageReplyMarkup',
{
chat_id:
chatId,

```
      message_id:
        messageId,

      reply_markup: {
        inline_keyboard: []
      }
    }
  );
} catch (error) {
  /*
   * اگر پیام قبلاً دکمه‌ای نداشت یا قابل ویرایش نبود،
   * مشکلی نیست؛ پیام جدید در ادامه ارسال می‌شود.
   */
  console.error(
    'editMessageReplyMarkup failed:',
    error
  );
}

await callApi(
  token,
  'sendMessage',
  {
    chat_id:
      chatId,

    text:
      view.text,

    parse_mode:
      'HTML',

    reply_markup:
      view.keyboard
  }
);

return;
```

}

await callApi(
token,
'editMessageText',
{
chat_id:
chatId,

```
  message_id:
    messageId,

  text:
    view.text,

  parse_mode:
    'HTML',

  reply_markup:
    view.keyboard
}
```

);
}

async function editFaqDetail(
env,
token,
chatId,
messageId,
userId,
index
) {
const view =
getFaqDetailView(index);

if (!view) {
return;
}

await setState(
env,
userId,
`faq_${index}`
);

await callApi(
token,
'editMessageText',
{
chat_id:
chatId,

```
  message_id:
    messageId,

  text:
    view.text,

  parse_mode:
    'HTML',

  reply_markup:
    view.keyboard
}
```

);
}

/*

* نگاشت دکمه‌های کیبورد ثابت به state مربوطه.
  */
  const MENU_BUTTON_STATES = {
  '📦 مشاهده محصولات':
  'products',

'🛡️ اعتماد و اعتبار':
'trust',

'☎️ راه‌های ارتباطی':
'contact',

'📝 راهنمای ثبت سفارش':
'guide',

'❓ سوالات متداول':
'faq'
};

/*

* Messages
  */

export async function handleMessage(
env,
update
) {
const token =
getToken(env);

const message =
update.message;

if (!message) {
return;
}

const chatId =
message.chat?.id;

const userId =
message.from?.id;

if (!chatId || !userId) {
return;
}

await saveUserToDB(
env,
message.from
);

const text =
message.text?.trim();

if (!text) {
return;
}

if (
text === '/start' ||
text === 'شروع'
) {
await clearState(
env,
userId
);

```
await sendState(
  env,
  token,
  chatId,
  userId,
  'main'
);

return;
```

}

const targetState =
MENU_BUTTON_STATES[text];

await sendState(
env,
token,
chatId,
userId,
targetState || 'main'
);
}

/*

* Callback queries
  */

export async function handleCallback(
env,
update
) {
const token =
getToken(env);

const callback =
update.callback_query;

if (!callback) {
return;
}

const chatId =
callback.message?.chat?.id;

const messageId =
callback.message?.message_id;

const userId =
callback.from?.id;

const data =
callback.data;

if (
!chatId ||
!messageId ||
!userId ||
!data
) {
return;
}

/*

* فقط یک بار callback را پاسخ می‌دهیم.
  */
  try {
  await callApi(
  token,
  'answerCallbackQuery',
  {
  callback_query_id:
  callback.id
  }
  );
  } catch (error) {
  console.error(
  'answerCallbackQuery failed:',
  error
  );
  }

if (data === 'main') {
await clearState(
env,
userId
);

```
await editState(
  env,
  token,
  chatId,
  messageId,
  userId,
  'main'
);

return;
```

}

const knownInlineStates = [
'products',
'trust',
'guide',
'contact',
'address',
'phone',
'faq'
];

if (
knownInlineStates.includes(data)
) {
await editState(
env,
token,
chatId,
messageId,
userId,
data
);

```
return;
```

}

if (
data.startsWith('faq_')
) {
const index =
Number.parseInt(
data.slice(4),
10
);

```
if (
  !Number.isInteger(index) ||
  index < 0 ||
  index >= faq.length
) {
  return;
}

await editFaqDetail(
  env,
  token,
  chatId,
  messageId,
  userId,
  index
);
```

}
}
