/*
 * لایه ارتباط با API تلگرام.
 * هیچ منطق یا متنی از ربات اینجا نیست، فقط ارسال درخواست.
 */

export function getToken(env) {
  return (
    env.BOT_TOKEN ||
    env.TELEGRAM_BOT_TOKEN
  );
}


export async function callApi(
  token,
  method,
  body
) {
  if (!token) {
    throw new Error(
      'Telegram bot token is missing.'
    );
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json'
      },

      body: JSON.stringify(body)
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Telegram API returned invalid JSON for ${method}.`
    );
  }

  if (
    !response.ok ||
    !result.ok
  ) {
    throw new Error(
      `Telegram API error in ${method}: ` +
      `${result.description || response.statusText}`
    );
  }

  return result.result;
}
