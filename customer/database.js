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
    console.error("Error saving user to DB:", error);
  }
}