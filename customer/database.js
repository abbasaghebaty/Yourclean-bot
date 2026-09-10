async function ensureUsersTable(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id INTEGER PRIMARY KEY,
      username TEXT DEFAULT '',
      first_name TEXT DEFAULT '',
      last_name TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}


export async function saveUserToDB(
  env,
  user
) {
  if (
    !env.DB ||
    !user?.id
  ) {
    return;
  }

  try {
    await ensureUsersTable(env);

    await env.DB.prepare(`
      INSERT INTO users (
        telegram_id,
        username,
        first_name,
        last_name
      )
      VALUES (?, ?, ?, ?)

      ON CONFLICT(telegram_id)
      DO UPDATE SET
        username = excluded.username,
        first_name = excluded.first_name,
        last_name = excluded.last_name
    `)
      .bind(
        user.id,
        user.username || '',
        user.first_name || '',
        user.last_name || ''
      )
      .run();

  } catch (error) {
    /*
     * دیتابیس نباید مانع پاسخ ربات شود.
     */
    console.error(
      'Error saving user to D1:',
      error
    );
  }
}
