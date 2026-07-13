export default {
  // ==================== پردازش درخواست‌های اصلی ====================
  async fetch(request, env) {
    // فقط POST قبول کن
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const update = await request.json();
      
      // اگر پیام نبود، بیخیال
      if (!update.message) {
        return new Response("OK", { status: 200 });
      }

      const chatId = update.message.chat.id;
      const text = update.message.text || "";
      const firstName = update.message.from?.first_name || "کاربر";

      let reply = "";

      // ========== مدیریت دستورات ==========
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
        reply = `📩 شما گفتید: "${text}"

برای دریافت راهنما /help را وارد کنید.`;
      }

      // ========== ارسال پیام به تلگرام ==========
      const telegramApiUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
      
      try {
        const response = await fetch(telegramApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          }),
        });

        // اگر ارسال ناموفق بود، ذخیره در KV برای اجرای مجدد
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Telegram API Error:", errorText);
          
          // ذخیره در KV برای retry
          await saveForRetry(env, chatId, reply);
          
          return new Response("Saved for retry", { status: 202 });
        }

        // ========== ذخیره در KV (اختیاری) ==========
        if (env.MY_KV) {
          try {
            await env.MY_KV.put(`user_${chatId}_last_msg`, text, {
              expirationTtl: 86400
            });
          } catch (kvError) {
            console.error("KV Save Error:", kvError);
          }
        }

        return new Response("OK", { status: 200 });
        
      } catch (error) {
        // ========== اگر fetch خطا داد ==========
        console.error("❌ Fetch Error:", error);
        
        // ذخیره در KV برای retry
        await saveForRetry(env, chatId, reply);
        
        return new Response("Saved for retry", { status: 202 });
      }
      
    } catch (error) {
      console.error("❌ General Error:", error);
      return new Response("OK", { status: 200 });
    }
  },

  // ==================== اجرای مجدد پیام‌های ناموفق ====================
  async scheduled(event, env, ctx) {
    console.log("🔄 Running retry scheduler...");
    
    try {
      // لیست تمام پیام‌های معلق
      const list = await env.MY_KV.list({ prefix: "retry_" });
      
      if (list.keys.length === 0) {
        console.log("✅ No pending messages");
        return;
      }

      console.log(`📨 Found ${list.keys.length} pending messages`);

      for (const key of list.keys) {
        const data = await env.MY_KV.get(key.name);
        if (!data) continue;

        try {
          const { chatId, text, retryCount = 0, timestamp } = JSON.parse(data);
          
          // اگر بیشتر از ۳ بار تلاش شده، حذف کن
          if (retryCount >= 3) {
            console.log(`❌ Max retries exceeded for ${key.name}`);
            await env.MY_KV.delete(key.name);
            continue;
          }

          // اگر بیشتر از ۱ ساعت گذشته، حذف کن
          if (Date.now() - timestamp > 3600000) {
            console.log(`⏰ Message expired for ${key.name}`);
            await env.MY_KV.delete(key.name);
            continue;
          }

          console.log(`🔄 Retry ${retryCount + 1} for ${key.name}`);

          // تلاش مجدد برای ارسال
          const telegramApiUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
          
          const response = await fetch(telegramApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: text,
              parse_mode: "Markdown",
              disable_web_page_preview: true,
            }),
          });

          if (response.ok) {
            // ✅ ارسال موفق - حذف از KV
            console.log(`✅ Message sent successfully: ${key.name}`);
            await env.MY_KV.delete(key.name);
          } else {
            // ❌ باز هم ناموفق - افزایش تعداد تلاش
            console.log(`❌ Retry failed for ${key.name}`);
            await env.MY_KV.put(key.name, JSON.stringify({
              chatId,
              text,
              retryCount: retryCount + 1,
              timestamp
            }), { expirationTtl: 86400 });
          }
          
        } catch (error) {
          console.error(`❌ Error processing retry ${key.name}:`, error);
        }
      }
      
    } catch (error) {
      console.error("❌ Scheduler Error:", error);
    }
  },
};

// ==================== تابع کمکی برای ذخیره در KV ====================
async function saveForRetry(env, chatId, text) {
  if (!env.MY_KV) {
    console.warn("⚠️ MY_KV not configured");
    return;
  }

  try {
    const messageId = `${chatId}_${Date.now()}`;
    const key = `retry_${messageId}`;
    
    await env.MY_KV.put(key, JSON.stringify({
      chatId,
      text,
      retryCount: 0,
      timestamp: Date.now()
    }), { expirationTtl: 86400 }); // ۲۴ ساعت نگهداری کن
    
    console.log(`💾 Saved for retry: ${key}`);
  } catch (error) {
    console.error("❌ Failed to save for retry:", error);
  }
}
