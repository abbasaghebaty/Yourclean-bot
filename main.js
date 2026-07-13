export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // تست ساده برای GET
    if (request.method === "GET") {
      return new Response("Bot is running! ✅");
    }

    // دریافت پیام‌های تلگرام از طریق Webhook (POST)
    if (request.method === "POST") {
      try {
        const update = await request.json();

        // بررسی وجود پیام
        if (update.message) {
          const chatId = update.message.chat.id;
          const text = update.message.text || "";
          const firstName = update.message.chat.first_name || "کاربر";

          let reply = "";

          // مدیریت دستورات
          if (text === "/start") {
            reply = `سلام ${firstName} 👋\nبه ربات فروشگاه شما خوش آمدید.\nبرای دریافت اطلاعات بیشتر از /help استفاده کنید.`;
          } else if (text === "/help") {
            reply = `📋 راهنما:\n/start - شروع مجدد\n/help - نمایش این راهنما\n/shop - مشاهده محصولات\n/contact - ارتباط با پشتیبانی`;
          } else if (text === "/shop") {
            reply = `🛍 محصولات موجود:\n۱. محصول اول - ۱۰۰ تومان\n۲. محصول دوم - ۲۰۰ تومان\n۳. محصول سوم - ۱۵۰ تومان\nبرای خرید عدد محصول را وارد کنید.`;
          } else if (text === "/contact") {
            reply = `📞 برای ارتباط با پشتیبانی:\nایمیل: support@example.com\nتلفن: ۰۹۱۲۳۴۵۶۷۸۹`;
          } else if (text.startsWith("/")) {
            reply = `❌ دستور ناشناخته. برای مشاهده راهنما /help را وارد کنید.`;
          } else {
            // پاسخ به پیام‌های معمولی
            reply = `📩 شما گفتید: "${text}"\n\nبرای دریافت راهنما /help را وارد کنید.`;
          }

          // ارسال پاسخ به تلگرام
          const telegramApiUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
          
          const response = await fetch(telegramApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: reply,
              parse_mode: "HTML", // پشتیبانی از HTML ساده
            }),
          });

          // بررسی وضعیت ارسال
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Telegram API Error:", errorText);
            return new Response(`Error: ${errorText}`, { status: 500 });
          }

          // ذخیره در KV (اختیاری - در صورت نیاز)
          if (env.MY_KV) {
            try {
              await env.MY_KV.put(`user_${chatId}_last_msg`, text, {
                expirationTtl: 86400 // 24 ساعت
              });
            } catch (kvError) {
              console.error("KV Error:", kvError);
              // خطای KV مشکلی در پاسخ ایجاد نمی‌کند
            }
          }
        }

        return new Response("OK", { status: 200 });
      } catch (error) {
        console.error("Error processing request:", error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};
