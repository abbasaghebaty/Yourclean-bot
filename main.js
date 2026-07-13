export default {
  async fetch(request, env) {
    // فقط اجازه POST از تلگرام
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const update = await request.json();
      
      // بررسی وجود پیام
      if (!update.message) {
        return new Response("OK", { status: 200 });
      }

      const chatId = update.message.chat.id;
      const text = update.message.text || "";
      const firstName = update.message.from?.first_name || "کاربر";

      let reply = "";

      // مدیریت دستورات
      if (text === "/start") {
        reply = `سلام ${firstName} 👋✨

به ربات رسمی فروشگاه شما خوش آمدید 🛒

اینجا می‌تونید:
🔹 قیمت و مشخصات محصولات رو سریع دریافت کنید
🔹 محصولات موجود رو مشاهده کنید
🔹 برای خرید و راهنمایی با ما در ارتباط باشید

ما تلاش می‌کنیم خرید شما سریع‌تر، راحت‌تر و مطمئن‌تر انجام بشه 💚

برای شروع یکی از گزینه‌ها رو انتخاب کنید 👇`;
        
      } else if (text === "/help") {
        reply = `📋 راهنما:
/start - شروع مجدد
/help - نمایش این راهنما
/shop - مشاهده محصولات
/contact - ارتباط با پشتیبانی`;
        
      } else if (text === "/shop") {
        reply = `🛍 محصولات موجود:
1️⃣ محصول اول - ۱۰۰ تومان
2️⃣ محصول دوم - ۲۰۰ تومان
3️⃣ محصول سوم - ۱۵۰ تومان

برای خرید عدد محصول را وارد کنید.`;
        
      } else if (text === "/contact") {
        reply = `📞 برای ارتباط با پشتیبانی:
ایمیل: support@example.com
تلفن: ۰۹۱۲۳۴۵۶۷۸۹`;
        
      } else if (text.startsWith("/")) {
        reply = `❌ دستور ناشناخته. برای مشاهده راهنما /help را وارد کنید.`;
        
      } else {
        // پاسخ به پیام‌های معمولی
        reply = `📩 شما گفتید: "${text}"

برای دریافت راهنما /help را وارد کنید.`;
      }

      // ارسال پاسخ به تلگرام با timeout بیشتر
      const telegramApiUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
      
      const response = await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
          parse_mode: "Markdown", // استفاده از Markdown به جای HTML
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Telegram API Error:", errorText);
        // هنوز به تلگرام OK برگردونیم تا دوباره ارسال نکنه
        return new Response("OK", { status: 200 });
      }

      // ذخیره در KV (اختیاری)
      if (env.MY_KV) {
        try {
          await env.MY_KV.put(`user_${chatId}_last_msg`, text, {
            expirationTtl: 86400
          });
        } catch (kvError) {
          console.error("KV Error:", kvError);
        }
      }

      return new Response("OK", { status: 200 });
      
    } catch (error) {
      console.error("Error processing request:", error);
      // همیشه OK برگردون تا تلگرام دوباره ارسال نکنه
      return new Response("OK", { status: 200 });
    }
  },
};
