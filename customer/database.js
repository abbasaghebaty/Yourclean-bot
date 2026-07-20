export async function saveUserToDB(env, user) {
  try {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO users 
      (telegram_id, username, first_name, last_name, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))`
    )
    .bind(
      user.id,
      user.username || "",
      user.first_name || "",
      user.last_name || ""
    )
    .run();
  } catch (error) {
    try {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO users 
        (telegram_id, username, first_name, last_name)
        VALUES (?, ?, ?, ?)`
      )
      .bind(
        user.id,
        user.username || "",
        user.first_name || "",
        user.last_name || ""
      )
      .run();
    } catch (e) {
      console.error("Error saving user to DB:", e);
    }
  }
}

export async function ensureUsersSchema(env) {
  try {
    await env.DB.exec(`ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`);
  } catch (e) {
    if (!e.message.includes('duplicate column name')) {
      console.error('Schema migration error:', e);
    }
  }
}