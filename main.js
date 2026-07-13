export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // تست ساده
    if (request.method === "GET") {
      return new Response("Bot is running!");
    }

    // دریافت پیام تلگرام
    if (request.method === "POST") {
      const update = await request.json();

      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text || "";

        let reply = "پیامت دریافت شد ✅";

        if (text === "/start") {
          reply = "سلام 👋\nبه ربات فروشگاه شما خوش آمدید.";
        } else if (text) {
          reply = `شما گفتید: ${text}`;
        }

        await fetch(
          `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: reply,
            }),
          }
        );
      }

      return new Response("OK");
    }

    return new Response("OK");
  },
};
