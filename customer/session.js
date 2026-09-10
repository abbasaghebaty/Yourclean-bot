/*
 * ذخیره‌سازی state فعلی هر کاربر در KV.
 *
 * توجه: نسخه‌های قبلی state را به‌صورت آرایه (stack) ذخیره می‌کردند
 * اما هیچ‌جای کد واقعاً از پاپ‌کردن استک استفاده نمی‌شد، همیشه فقط
 * آخرین عضو آرایه خوانده می‌شد. برای سادگی، اینجا فقط یک state
 * (رشته) ذخیره می‌شود؛ کد همچنان مقادیر قدیمیِ آرایه‌ای را هم
 * می‌خواند تا با KV موجود سازگار بماند.
 */

const SESSION_TTL_SECONDS = 3600;

function sessionKey(userId) {
  return `session:${userId}`;
}


export async function getState(
  env,
  userId
) {
  const raw =
    await env.RATE_LIMITER.get(
      sessionKey(userId)
    );

  if (!raw) {
    return 'main';
  }

  try {
    const parsed = JSON.parse(raw);

    /*
     * سازگاری با مقادیر قدیمی که به شکل استک ذخیره شده‌اند.
     */
    if (Array.isArray(parsed)) {
      return parsed.length
        ? parsed[parsed.length - 1]
        : 'main';
    }

    return (
      typeof parsed === 'string' &&
      parsed
    )
      ? parsed
      : 'main';
  } catch {
    return raw || 'main';
  }
}


export async function setState(
  env,
  userId,
  state
) {
  await env.RATE_LIMITER.put(
    sessionKey(userId),
    JSON.stringify(state),
    {
      expirationTtl:
        SESSION_TTL_SECONDS
    }
  );
}


export async function clearState(
  env,
  userId
) {
  await setState(
    env,
    userId,
    'main'
  );
}
