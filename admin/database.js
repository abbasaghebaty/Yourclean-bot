export async function getTotalUsers(env) {
  const result = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
  return result.count;
}

export async function getTodayUsers(env) {
  try {
    const result = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE('now')"
    ).first();
    return result.count;
  } catch (error) {
    return 0;
  }
}

export async function getTodayOrders(env) {
  try {
    const result = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now')"
    ).first();
    return result.count;
  } catch (error) {
    return 0;
  }
}

export async function broadcastMessage(env, token, message) {
  const { results } = await env.DB.prepare('SELECT telegram_id FROM users').all();
  let success = 0;
  let fail = 0;

  for (const user of results) {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_id,
          text: message
        })
      });
      success++;
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      fail++;
    }
  }
  return { success, fail };
}